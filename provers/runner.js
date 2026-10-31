// Runs the automated provers (Prover9, Mace4, E) in the browser.
//
// Each prover is a WebAssembly build of the original C program (see provers/build/). It is loaded from
// provers/<name>.wasm.js, a script that holds the program compressed, because browsers let a page load scripts
// but not .wasm files when LogicUS is opened as a local file. A run happens in its own Web Worker, so the page stays
// responsive and a run that does not stop on time can be killed.
//
//   LogicUSProvers.run("prover9", ["-t", "10"], input, { timeoutMs: 15000 })
//       .then(({ exitCode, stdout, stderr, timedOut }) => ...)

const LogicUSProvers = (function () {
    const base = new URL('.', document.currentScript.src);
    const modules = {};   // name -> Promise of WebAssembly.Module
    const pending = {};   // name -> resolve function, while its script loads

    // Called by provers/<name>.wasm.js with the program (gzip + base64).
    function register(name, data) {
        if (pending[name]) {
            pending[name](data);
            delete pending[name];
        }
    }

    async function decode(data) {
        const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
        return WebAssembly.compile(await new Response(stream).arrayBuffer());
    }

    function load(name) {
        if (!modules[name]) {
            modules[name] = new Promise((resolve, reject) => {
                pending[name] = resolve;
                const script = document.createElement('script');
                script.src = new URL(`${name}.wasm.js`, base).href;
                script.onerror = () => reject(new Error(`cannot load ${script.src}`));
                document.head.appendChild(script);
            }).then(decode).catch(e => {
                delete modules[name];
                delete pending[name];
                throw e;
            });
        }
        return modules[name];
    }

    let workerURL = null;

    function run(name, args, stdin, { timeoutMs = 60000 } = {}) {
        return load(name).then(module => new Promise((resolve, reject) => {
            // the worker comes from a Blob, which also works for pages opened as local files
            workerURL = workerURL || URL.createObjectURL(new Blob([`(${proverWorker})();`], { type: 'text/javascript' }));
            const worker = new Worker(workerURL);
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

    return { run, load, register };
})();


// The code of the worker that runs one program compiled to WebAssembly (wasm32-wasi).
//
// It receives { module: WebAssembly.Module, args: [String], stdin: String } and answers
// { exitCode: Int, stdout: String, stderr: String } or { error: String }.
//
// Only the part of WASI preview 1 that Prover9, Mace4 and E import is implemented: program arguments, an empty
// environment, clocks, standard input/output/error and exit. There is no file system: the problem is given on
// standard input.
function proverWorker() {
    const ESUCCESS = 0, EBADF = 8, ENOENT = 44, ENOSYS = 52, ESPIPE = 70;

    class ProcessExit {
        constructor(code) { this.code = code; }
    }

    self.onmessage = async (event) => {
        const { module, args, stdin } = event.data;
        const encoder = new TextEncoder();
        const input = encoder.encode(stdin || '');
        let inputPos = 0;
        const output = { 1: [], 2: [] };
        let memory = null;

        const view = () => new DataView(memory.buffer);
        const bytes = () => new Uint8Array(memory.buffer);
        const argv = args.map(a => encoder.encode(a + '\0'));
        const start = performance.now();

        const wasi = {
            args_sizes_get(countPtr, sizePtr) {
                view().setUint32(countPtr, argv.length, true);
                view().setUint32(sizePtr, argv.reduce((n, a) => n + a.length, 0), true);
                return ESUCCESS;
            },
            args_get(argvPtr, bufPtr) {
                for (const a of argv) {
                    view().setUint32(argvPtr, bufPtr, true);
                    bytes().set(a, bufPtr);
                    argvPtr += 4;
                    bufPtr += a.length;
                }
                return ESUCCESS;
            },
            environ_sizes_get(countPtr, sizePtr) {
                view().setUint32(countPtr, 0, true);
                view().setUint32(sizePtr, 0, true);
                return ESUCCESS;
            },
            environ_get() { return ESUCCESS; },
            clock_time_get(id, precision, timePtr) {
                // 0 = realtime; monotonic and (emulated) process/thread CPU clocks count from the start
                const ns = id === 0 ? BigInt(Date.now()) * 1000000n
                    : BigInt(Math.round((performance.now() - start) * 1e6));
                view().setBigUint64(timePtr, ns, true);
                return ESUCCESS;
            },
            fd_write(fd, iovs, iovsLen, writtenPtr) {
                if (fd !== 1 && fd !== 2) return EBADF;
                let written = 0;
                for (let i = 0; i < iovsLen; i++) {
                    const ptr = view().getUint32(iovs + 8 * i, true);
                    const len = view().getUint32(iovs + 8 * i + 4, true);
                    output[fd].push(bytes().slice(ptr, ptr + len));
                    written += len;
                }
                view().setUint32(writtenPtr, written, true);
                return ESUCCESS;
            },
            fd_read(fd, iovs, iovsLen, readPtr) {
                if (fd !== 0) return EBADF;
                let read = 0;
                for (let i = 0; i < iovsLen && inputPos < input.length; i++) {
                    const ptr = view().getUint32(iovs + 8 * i, true);
                    const len = view().getUint32(iovs + 8 * i + 4, true);
                    const chunk = input.subarray(inputPos, inputPos + len);
                    bytes().set(chunk, ptr);
                    inputPos += chunk.length;
                    read += chunk.length;
                }
                view().setUint32(readPtr, read, true);
                return ESUCCESS;
            },
            fd_fdstat_get(fd, statPtr) {
                if (fd > 2) return EBADF;
                const v = view();
                v.setUint8(statPtr, 2);                           // filetype: character device
                v.setUint16(statPtr + 2, 0, true);                // flags
                v.setBigUint64(statPtr + 8, 0xffffffffn, true);   // rights
                v.setBigUint64(statPtr + 16, 0xffffffffn, true);  // inherited rights
                return ESUCCESS;
            },
            fd_fdstat_set_flags(fd) { return fd > 2 ? EBADF : ESUCCESS; },
            fd_seek(fd) { return fd > 2 ? EBADF : ESPIPE; },
            fd_close(fd) { return fd > 2 ? EBADF : ESUCCESS; },
            fd_prestat_get() { return EBADF; },              // no preopened directories
            fd_prestat_dir_name() { return EBADF; },
            path_open() { return ENOENT; },
            path_filestat_get() { return ENOENT; },
            path_unlink_file() { return ENOENT; },
            poll_oneoff() { return ENOSYS; },
            proc_exit(code) { throw new ProcessExit(code); },
        };

        let exitCode = 0;
        try {
            const instance = await WebAssembly.instantiate(module, { wasi_snapshot_preview1: wasi });
            memory = instance.exports.memory;
            instance.exports._start();
        } catch (e) {
            if (e instanceof ProcessExit) {
                exitCode = e.code;
            } else {
                self.postMessage({ error: String(e && e.message || e) });
                return;
            }
        }
        const decode = (chunks) => {
            const decoder = new TextDecoder();
            return chunks.map(c => decoder.decode(c, { stream: true })).join('') + decoder.decode();
        };
        self.postMessage({ exitCode, stdout: decode(output[1]), stderr: decode(output[2]) });
    };
}
