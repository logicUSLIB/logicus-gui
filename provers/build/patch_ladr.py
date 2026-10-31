"""Make the LADR sources (Prover9/Mace4) build for wasm32-wasi: no fork, no wait."""
import pathlib, sys

root = pathlib.Path(sys.argv[1])
search = root / "provers.src" / "search.c"
src = search.read_text()
if "__wasi__" not in src:
    src = src.replace("#include <sys/wait.h>\n", "#ifndef __wasi__\n#include <sys/wait.h>\n#endif\n", 1)
    head = "Prover_results forking_search(Prover_input input)\n{\n"
    assert head in src
    src = src.replace(head, head + "#ifdef __wasi__\n  return search(input);  /* no fork() in WebAssembly */\n#else\n", 1)
    tail = "}  /* forking_search */"
    assert tail in src
    src = src.replace(tail, "#endif\n" + tail, 1)
    search.write_text(src)
print("patched", search)
