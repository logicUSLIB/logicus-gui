"""Make the E prover sources build for wasm32-wasi (single process, no network)."""
import pathlib, sys

root = pathlib.Path(sys.argv[1])

def patch(rel, old, new):
    f = root / rel
    s = f.read_text()
    if new in s:
        return
    assert old in s, (rel, old)
    f.write_text(s.replace(old, new, 1))
    print("patched", rel)

# WASI's struct rusage only has the user and system times.
patch("BASICS/clb_error.c",
      '''   CommentPrint(out,
      " Maximum resident set size: %ld pages\\n",
      usage.ru_maxrss);''',
      '''#ifndef __wasi__
   CommentPrint(out,
      " Maximum resident set size: %ld pages\\n",
      usage.ru_maxrss);
#endif''')

# Sockets are only used by e_server/e_client, not by eprover.
f = root / "INOUT/cio_network.c"
s = f.read_text()
if not s.startswith("#ifndef __wasi__"):
    f.write_text("#ifndef __wasi__ /* no sockets in WebAssembly */\n" + s + "\n#endif\n")
    print("patched INOUT/cio_network.c")

# long is 32 bits in wasm32, but E's built-in strategies use 64-bit LONG_MAX
# ("no limit"): saturate instead of failing.
patch("INOUT/cio_basicparser.c",
      '''      if((AktToken(in)->numval-1) > LONG_MAX)
      {
         AktTokenError(in, "Long integer underflow", false);
      }
      value = -AktToken(in)->numval;''',
      '''#ifdef __wasi__
      value = ((AktToken(in)->numval-1) > LONG_MAX) ? LONG_MIN : -(long)AktToken(in)->numval;
#else
      if((AktToken(in)->numval-1) > LONG_MAX)
      {
         AktTokenError(in, "Long integer underflow", false);
      }
      value = -AktToken(in)->numval;
#endif''')
patch("INOUT/cio_basicparser.c",
      '''      if(AktToken(in)->numval > LONG_MAX)
      {
         AktTokenError(in, "Long integer overflow", false);
      }
      value = AktToken(in)->numval;''',
      '''#ifdef __wasi__
      value = (AktToken(in)->numval > LONG_MAX) ? LONG_MAX : (long)AktToken(in)->numval;
#else
      if(AktToken(in)->numval > LONG_MAX)
      {
         AktTokenError(in, "Long integer overflow", false);
      }
      value = AktToken(in)->numval;
#endif''')

# No SIGXCPU in WebAssembly: poll the CPU limit set with setrlimit() (see
# wasm/compat/stubs.c) once per given clause.
patch("CONTROL/cco_proofproc.c",
      '''      count++;
      unsatisfiable = ProcessClause(state, control, answer_limit);''',
      '''      count++;
#ifdef __wasi__
      { extern void wasm_check_cpu_limit(void); wasm_check_cpu_limit(); }
#endif
      unsatisfiable = ProcessClause(state, control, answer_limit);''')
