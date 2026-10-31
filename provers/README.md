# Automated provers in the browser

The nodes `Prover9Mace4` and `EProver` run these programs inside the browser, compiled to WebAssembly
(wasm32-wasi). Nothing is sent to a server.

| File | Program | Version | Author | License |
|------|---------|---------|--------|---------|
| `prover9.wasm` | Prover9 (proof search) | LADR 2017-11A (CIIRC), commit [`cdca95a`](https://github.com/ai4reason/Prover9/tree/cdca95a51d3c3459b8fd2ebbb5ac1504be2172e3) | William McCune | GPL-2.0 |
| `mace4.wasm` | Mace4 (finite model search) | same | William McCune | GPL-2.0 |
| `eprover.wasm` | E (saturation prover) | [E 3.5.4](https://github.com/eprover/eprover/tree/E-3.5.4) | Stephan Schulz and contributors | GPL-2.0-or-later |

They are separate programs, distributed here unmodified except for the portability patches below. Their source code
is in the repositories above, and `build/` contains everything needed to rebuild the binaries.

## How they run

`runner.js` loads a program once, and runs each problem in a new Web Worker (`wasi-worker.js`), which provides the
few WASI calls the programs use: arguments, clocks, standard input and output. The problem is given on standard input
and the output is returned when the program exits. If a run does not stop on its own a few seconds after its time
limit, the worker is terminated.

The page must be served over HTTP (GitHub Pages, or `python3 -m http.server` locally): browsers do not let a page
opened as a local file load WebAssembly or start workers.

## Differences with the native programs

WebAssembly has no processes, signals or resource limits, so:

- E runs a single strategy (`--auto`) instead of a schedule of strategies (`--auto-schedule` forks a process
  for each one). It is weaker on hard problems, and fine for the size of problems in a course.
- The time limits are checked by the programs themselves (E checks its CPU limit once per given clause), and are
  measured in wall-clock time. There is no memory limit apart from the browser's.
- `long` is 32 bits: E reads its built-in "no limit" values (2^63 − 1) as 2^31 − 1.

During development, 90 random FOL problems (with and without equality) generated with logicus-fol gave the same
answers with the WebAssembly and the native builds: the same Prover9 output (apart from times and process data), the
same Mace4 models and the same SZS status for E.

## Rebuilding

```sh
provers/build/build.sh
```

The script downloads the [WASI SDK](https://github.com/WebAssembly/wasi-sdk) 25 (or uses `$WASI_SDK_PATH`), fetches
the sources at the versions above, applies `patch_ladr.py` and `patch_e.py`, builds with the stubs in `compat/`,
and copies the stripped `.wasm` files here. The build is reproducible: it gives the same files byte for byte.

The patches:

- LADR: `forking_search()` calls `search()` directly (no `fork`). Prover9 leaves the search with `setjmp`/`longjmp`,
  which needs WebAssembly exception handling (all current browsers support it).
- E: no `ru_maxrss` in the statistics, no network code (only used by `e_server`), 64-bit integer limits are
  saturated instead of rejected, and the saturation loop polls the CPU limit (`wasm_check_cpu_limit` in
  `compat/stubs.c`).
