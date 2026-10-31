// Runs one command-line program compiled to WebAssembly (wasm32-wasi) inside a Web Worker.
//
// The page posts { module: WebAssembly.Module, args: [String], stdin: String } and receives
// { exitCode: Int, stdout: String, stderr: String } or { error: String }.
//
// Only the part of WASI preview 1 that Prover9, Mace4 and E import is implemented: program arguments,
// an empty environment, clocks, standard input/output/error and exit. There is no file system: the
// problem is given on standard input.

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
            v.setUint8(statPtr, 2);                       // filetype: character device
            v.setUint16(statPtr + 2, 0, true);            // flags
            v.setBigUint64(statPtr + 8, 0xffffffffn, true);  // rights
            v.setBigUint64(statPtr + 16, 0xffffffffn, true); // inherited rights
            return ESUCCESS;
        },
        fd_fdstat_set_flags(fd) { return fd > 2 ? EBADF : ESUCCESS; },
        fd_seek(fd) { return fd > 2 ? EBADF : ESPIPE; },
        fd_close(fd) { return fd > 2 ? EBADF : ESUCCESS; },
        fd_prestat_get() { return EBADF; },           // no preopened directories
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
