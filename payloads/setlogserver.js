(async () => {
    if(version_string === "Y2JB 1.0 by Gezine") {
        
        await log("setlogserver não é suportado no Y2JB 1.0");    
        
    } else {
        // Altere para o endereço do seu servidor
        LOG_SERVER = 'http://192.168.1.180:8080/log';
        
        await log("Definindo a URL do servidor de log para " + LOG_SERVER);    
        
        await checkLogServer();
        
        if(NETWORK_LOGGING) {
            await log("Conectado com sucesso ao servidor de log");
        } else {
            await log("Falha ao conectar com o servidor de log");
        }
    }
    
})()
