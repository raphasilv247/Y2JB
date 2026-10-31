(async function() {
    check_jailbroken();
    
    await log("Teste 1: Syscall direta");
    let sym_addr = alloc_string("sceKernelAllocateMainDirectMemory");
    let addr_out = malloc(0x10);
    
    let result = syscall(SYSCALL.dlsym, LIBKERNEL_HANDLE, sym_addr, addr_out);
    if (result === 0xffffffffffffffffn) {
        await log("Erro no dlsym: " + get_error_string());
    }

    await log("sceKernelAllocateMainDirectMemory : " +  toHex(read64(addr_out)));
    
})();

