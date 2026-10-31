// Runs the automated provers (Prover9, Mace4, E) in the browser.
//
// Each prover is a WebAssembly build of the original C program (see provers/build/). A run happens in its own
// Web Worker, so the page stays responsive and a run that does not stop on time can be killed.
//
//   LogicUSProvers.run("prover9", ["-t", "10"], input, { timeoutMs: 15000 })
//       .then(({ exitCode, stdout, stderr, timedOut }) => ...)

const LogicUSProvers = (function () {
    const base = new URL('.', document.currentScript.src);
    const files = { prover9: 'prover9.wasm', mace4: 'mace4.wasm', eprover: 'eprover.wasm' };
    const modules = {};

    function load(name) {
        if (!modules[name]) {
            const url = new URL(files[name], base);
            modules[name] = fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`cannot load ${url} (HTTP ${response.status})`);
                    return response.arrayBuffer();
                })
                .then(buffer => WebAssembly.compile(buffer))
                .catch(e => {
                    delete modules[name];
                    if (location.protocol === 'file:') {
                        throw new Error('The provers need LogicUS to be opened from a web server, not as a local file '
                            + '(for instance, run "python3 -m http.server" in the LogicUS folder and open http://localhost:8000/LogicUS.html).');
                    }
                    throw e;
                });
        }
        return modules[name];
    }

    function run(name, args, stdin, { timeoutMs = 60000 } = {}) {
        return load(name).then(module => new Promise((resolve, reject) => {
            const worker = new Worker(new URL('wasi-worker.js', base));
            const timer = setTimeout(() => {
                worker.terminate();
                resolve({ exitCode: null, stdout: '', stderr: '', timedOut: true });
            }, timeoutMs);
            worker.onmessage = (event) => {
                clearTimeout(timer);
                worker.terminate();
                if (event.data.error) {
                    reject(new Error(`${name}: ${event.data.error}`));
                } else {
                    resolve({ ...event.data, timedOut: false });
                }
            };
            worker.onerror = (event) => {
                clearTimeout(timer);
                worker.terminate();
                reject(new Error(`${name}: ${event.message || 'the worker failed'}`));
            };
            worker.postMessage({ module, args: [name, ...args], stdin });
        }));
    }

    return { run, load };
})();
