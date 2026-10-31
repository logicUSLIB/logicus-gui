#!/bin/sh
# Build Prover9, Mace4, prooftrans, interpformat, ladr_to_tptp, tptp_to_ladr and E for WebAssembly (wasm32-wasi),
# copy them to provers/, and write the provers/<name>.wasm.js scripts that the page loads (embed.py) and the
# catalogs of options of Prover9 and Mace4 (options.py) and E (eoptions.py).
#
#   provers/build/build.sh
#
# Needs git, make, curl, tar and python3. The WASI SDK (clang for WebAssembly) is downloaded from its GitHub
# release unless WASI_SDK_PATH points to an installed one. Sources are fetched at the versions below and patched
# by patch_ladr.py and patch_e.py; compat/ supplies the POSIX calls that WASI lacks (processes, resource limits).
set -eu

LADR_REPO=https://github.com/ai4reason/Prover9.git
LADR_COMMIT=cdca95a51d3c3459b8fd2ebbb5ac1504be2172e3   # LADR 2017-11A (CIIRC)
E_REPO=https://github.com/eprover/eprover.git
E_TAG=E-3.5.4
WASI_SDK_VERSION=25

HERE=$(cd "$(dirname "$0")" && pwd)
OUT=$(dirname "$HERE")
WORK=${WORK:-$HERE/work}
mkdir -p "$WORK"

# --- WASI SDK -------------------------------------------------------------------------------------------------
if [ -z "${WASI_SDK_PATH:-}" ]; then
    case "$(uname -s)-$(uname -m)" in
        Linux-x86_64) PLATFORM=x86_64-linux ;;
        Linux-aarch64) PLATFORM=arm64-linux ;;
        Darwin-arm64) PLATFORM=arm64-macos ;;
        Darwin-x86_64) PLATFORM=x86_64-macos ;;
        *) echo "Unsupported platform: set WASI_SDK_PATH" >&2; exit 1 ;;
    esac
    WASI_SDK_PATH=$WORK/wasi-sdk-$WASI_SDK_VERSION.0-$PLATFORM
    if [ ! -d "$WASI_SDK_PATH" ]; then
        curl -sSL "https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-$WASI_SDK_VERSION/wasi-sdk-$WASI_SDK_VERSION.0-$PLATFORM.tar.gz" \
            | tar xz -C "$WORK"
    fi
fi
CC="$WASI_SDK_PATH/bin/clang --target=wasm32-wasip1 --sysroot=$WASI_SDK_PATH/share/wasi-sysroot"
AR="$WASI_SDK_PATH/bin/llvm-ar"
STRIP="$WASI_SDK_PATH/bin/llvm-strip"
EMULATION="-D_WASI_EMULATED_SIGNAL -D_WASI_EMULATED_PROCESS_CLOCKS -D_WASI_EMULATED_GETPID -D_WASI_EMULATED_MMAN"
EMULATION_LIBS="-lwasi-emulated-signal -lwasi-emulated-process-clocks -lwasi-emulated-getpid -lwasi-emulated-mman"
STACK="-Wl,-z,stack-size=16777216"

# --- Prover9 and Mace4 (LADR) ---------------------------------------------------------------------------------
LADR=$WORK/ladr
if [ ! -d "$LADR" ]; then
    git init -q "$LADR"
    git -C "$LADR" fetch -q --depth 1 "$LADR_REPO" "$LADR_COMMIT"
    git -C "$LADR" checkout -q FETCH_HEAD
fi
python3 "$HERE/patch_ladr.py" "$LADR"
# setjmp/longjmp (used by Prover9 to leave the search) need WebAssembly exception handling
LADR_FLAGS="-DPRIMITIVE_ENVIRONMENT $EMULATION -mllvm -wasm-enable-sjlj -Wno-everything"
(cd "$LADR/ladr" && make -s libladr.a CC="$CC" AR="$AR" XFLAGS="$LADR_FLAGS")
(cd "$LADR/mace4.src" && make -s libmace4.a mace4.o CC="$CC" AR="$AR" XFLAGS="$LADR_FLAGS" \
    && $CC -O2 -o mace4.wasm mace4.o libmace4.a ../ladr/libladr.a -lm $EMULATION_LIBS -lsetjmp $STACK)
PROVER9_OBJS="index_lits.o forward_subsume.o demodulate.o pred_elim.o unfold.o semantics.o giv_select.o white_black.o actions.o search.o utilities.o provers.o foffer.o"
(cd "$LADR/provers.src" && make -s prover9.o ladr_to_tptp.o tptp_to_ladr.o $PROVER9_OBJS CC="$CC" XFLAGS="$LADR_FLAGS" \
    && for app in prover9 ladr_to_tptp tptp_to_ladr; do
           $CC -O2 -o $app.wasm $app.o $PROVER9_OBJS ../ladr/libladr.a -lm $EMULATION_LIBS -lsetjmp $STACK || exit 1
       done)
# prooftrans and interpformat: the output formats of proofs and models
(cd "$LADR/apps.src" && make -s prooftrans.o interpformat.o CC="$CC" XFLAGS="$LADR_FLAGS" \
    && for app in prooftrans interpformat; do
           $CC -O2 -o $app.wasm $app.o ../ladr/libladr.a -lm $EMULATION_LIBS -lsetjmp $STACK || exit 1
       done)

# --- E ----------------------------------------------------------------------------------------------------------
E=$WORK/eprover
if [ ! -d "$E" ]; then
    git clone -q --depth 1 --branch "$E_TAG" "$E_REPO" "$E"
fi
python3 "$HERE/patch_e.py" "$E"
E_CC="$CC -I$HERE/compat/include $EMULATION"
# E's Makefile.vars without -DTAGGED_POINTERS (pointer tags assume 64-bit alignment)
E_BUILDFLAGS="-DSTACK_SIZE=32768 -DMEMORY_RESERVE_PARANOID -DPRINT_SOMEERRORS_STDOUT -DPRINT_TSTP_STATUS"
e_make() {
    dir=$1; shift
    (cd "$E/$dir" && make -s "$@" CC="$E_CC" AR="$AR rcs" BUILDFLAGS="$E_BUILDFLAGS" WFLAGS=-Wno-everything)
}
(cd "$E" && ./configure > /dev/null && make -s links)
(cd "$E/CONTRIB" && make -s config > /dev/null)
e_make CONTRIB/picosat-965 picosat.o version.o
(cd "$E/CONTRIB/picosat-965" && rm -f libpicosat.a && $AR rcs libpicosat.a picosat.o version.o)
ln -sf picosat-965/libpicosat.a "$E/CONTRIB/CONTRIB.a"
for lib in BASICS INOUT TERMS ORDERINGS CLAUSES LEARN HEURISTICS CONTROL; do
    touch "$E/$lib/Makefile.dependencies"
    e_make "$lib" "$lib.a"
done
e_make PROVER eprover.o
$E_CC -O2 -c -o "$WORK/stubs.o" "$HERE/compat/stubs.c"
(cd "$E/PROVER" && $CC -O3 -o eprover.wasm eprover.o ../lib/CONTROL.a ../lib/HEURISTICS.a ../lib/LEARN.a \
    ../lib/CLAUSES.a ../lib/ORDERINGS.a ../lib/TERMS.a ../lib/INOUT.a ../lib/BASICS.a ../lib/CONTRIB.a \
    "$WORK/stubs.o" -lm $EMULATION_LIBS $STACK)

# --- Install ------------------------------------------------------------------------------------------------------
for f in "$LADR/provers.src/prover9.wasm" "$LADR/mace4.src/mace4.wasm" "$LADR/apps.src/prooftrans.wasm" \
         "$LADR/apps.src/interpformat.wasm" "$LADR/provers.src/ladr_to_tptp.wasm" "$LADR/provers.src/tptp_to_ladr.wasm" \
         "$E/PROVER/eprover.wasm"; do
    "$STRIP" --strip-all -o "$OUT/$(basename "$f")" "$f"
done
# the scripts that the page loads (provers/<name>.wasm.js), and the options of Prover9 and Mace4 (provers/options.js)
python3 "$HERE/embed.py"
python3 "$HERE/options.py" "$LADR"
python3 "$HERE/eoptions.py" "$E"
ls -l "$OUT"/*.wasm "$OUT"/*.wasm.js
