
let BIN_NAME    = "kexp_2026_05_25.bin";
let ELFLDR_NAME = "elfldr-ps5-1360.elf";

let elfldr_addr = 0n;
let elfldr_size = 0n;
let elfldr_data = null;
let allproc     = 0n;
let master_pipe = null;
let victim_pipe = null;

function find_file(filename) {
    const search = [
        "/mnt/sandbox/" + TITLE_ID + "_000/download0/cache/splash_screen/aHR0cHM6Ly93d3cueW91dHViZS5jb20vdHY=/" + filename,
        "/mnt/sandbox/" + TITLE_ID + "_001/download0/cache/splash_screen/aHR0cHM6Ly93d3cueW91dHViZS5jb20vdHY=/" + filename,
        "/mnt/sandbox/" + TITLE_ID + "_002/download0/cache/splash_screen/aHR0cHM6Ly93d3cueW91dHViZS5jb20vdHY=/" + filename,
    ];
    for (const path of search) {
        if (file_exists(path)) {
            return path;
        }
    }
    return null;
}

async function map_shellcode(bin_data) {
    const size         = BigInt(bin_data.length);
    const aligned_size = (size + BigInt(PAGE_SIZE) - 1n) & ~(BigInt(PAGE_SIZE) - 1n);

    const fd_buf  = malloc(4n);
    const exec_fd = syscall(SYSCALL.jitshm_create, 0n, aligned_size, 0x7n);
    if (exec_fd < 0n) {
        throw new Error("jitshm_create falhou: " + toHex(exec_fd));
    }

    const entry_addr = syscall(SYSCALL.mmap, 0n, aligned_size, PROT_RWX, MAP_SHARED, exec_fd, 0n);
    if (entry_addr === 0n || entry_addr === BigInt(-1)) {
        throw new Error("mmap falhou (tamanho=0x" + aligned_size.toString(16) + ")");
    }

    write_buffer(entry_addr, bin_data);

    await log("Shellcode mapeado em " + toHex(entry_addr) + " (tamanho: 0x" + aligned_size.toString(16) + ")");
    return entry_addr;
}

async function run_shellcode(entry_addr) {
    const args = malloc(0x28n);
    write32(args + 0x00n, master_pipe[0]);
    write32(args + 0x04n, master_pipe[1]);
    write32(args + 0x08n, victim_pipe[0]);
    write32(args + 0x0Cn, victim_pipe[1]);
    write64(args + 0x10n, allproc);
    write64(args + 0x18n, elfldr_addr);
    write64(args + 0x20n, elfldr_size);

    const thr_handle = malloc(8n);

    await log("Criando thread do shellcode em: " + toHex(entry_addr));

    const ret = call(Thrd_create, thr_handle, entry_addr, args);
    if (ret !== 0n) {
        throw new Error("Thrd_create falhou: " + toHex(ret));
    }

    const handle = read64(thr_handle);
    await log("Thread do shellcode criada, handle: " + toHex(handle));

    const ret_val = malloc(8n);
    const join_ret = call(Thrd_join, handle, ret_val);
    if (join_ret !== 0n) {
        throw new Error("Thrd_join falhou: " + toHex(join_ret));
    }

    await log("Shellcode retornou: " + toHex(read64(ret_val)));
}

async function load_elfldr() {
    const path = find_file(ELFLDR_NAME);
    if (!path) {
        throw new Error("arquivo do elfldr não encontrado: " + ELFLDR_NAME);
    }

    elfldr_data = read_file(path);
    elfldr_addr = malloc(BigInt(elfldr_data.length));
    write_buffer(elfldr_addr, elfldr_data);
    elfldr_size = BigInt(elfldr_data.length);

    await log("elfldr @ " + toHex(elfldr_addr) + " tamanho: 0x" + elfldr_size.toString(16));
}

async function load_bin() {
    const path = find_file(BIN_NAME);
    if (!path) {
        throw new Error("arquivo bin do kexp não encontrado: " + BIN_NAME);
    }

    const bin_data = read_file(path);
    await log("Tamanho do bin: " + bin_data.length + " (0x" + bin_data.length.toString(16) + ")");

    const entry_addr = await map_shellcode(bin_data);
    await run_shellcode(entry_addr);

    await log("=== Shellcode concluído ===");
}

async function load_aioshellcode(arg_allproc, arg_master_pipe, arg_victim_pipe) {
    check_jailbroken();
    
    allproc     = arg_allproc;
    master_pipe = arg_master_pipe;
    victim_pipe = arg_victim_pipe;

    await log("=== Shellcode AIO JB do PS5 ===");
    await load_elfldr();
    await load_bin();
}
