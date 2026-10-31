# Y2JB

Execução de código em userland usando o app do YouTube do PS5.

## Requisitos

- PS5 com firmware 4.03 ou superior

### Para PS5 com jailbreak (Webkit, Lua, BD-JB)
- Conta fake ou legítima ativada no PS5
- Para firmware 4.03 a 12.40, obtenha o PKG do app YouTube (PPSA01650) versão 01.000.003
- Para firmware 12.60 ou superior, obtenha o PKG do app YouTube (PPSA01650) versão 01.000.030
- Acesso FTP ao console

### Para PS5 sem jailbreak
- Pen drive USB
- Arquivo de backup pronto

## Instruções de configuração

### Configurar o DNS da rede (opcional, mas altamente recomendado)

1. Acesse **Configurações > Rede > Configurações > Configurar conexão com a Internet**
2. Role até o final e selecione **Configurar manualmente**
3. Escolha o tipo de conexão:
   - **Usar Wi-Fi**: digite o nome e a senha da rede manualmente e defina a segurança como "WPA-Personal..."
   - **Usar cabo LAN**: siga para o próximo passo
4. Em **Configurações de DNS**, altere de "Automático" para **Manual**
5. Defina o **DNS primário** como `127.0.0.2` (deixe o DNS secundário em branco)
6. Pressione **Concluído** e aguarde a conexão ser estabelecida

**Observação:** Você pode ver um erro de rede/PSN. Isso é esperado e pode ser ignorado com segurança. O console continuará funcionando normalmente para o envio de payloads do YouTube.

**Alternativa:** em vez de usar 127.0.0.2, você pode bloquear os servidores da PSN usando um servidor DNS personalizado.

#### Por que definir o DNS como 127.0.0.2 é necessário?

A configuração de DNS é essencial para que o Y2JB funcione corretamente, por dois motivos técnicos:

1. **Bloqueio de conexões com a PSN**: definir o DNS como 127.0.0.2 (localhost) impede que o PS5 alcance os servidores da PlayStation Network. Isso bloqueia tanto o app do YouTube quanto os avisos de atualização do firmware do sistema, que poderiam interferir no exploit.

### Ativação de conta fake

**Observação:** se você estiver usando o arquivo de backup da página de releases, pode pular esta seção.

O Y2JB exige uma **conta com ativação fake** para funcionar corretamente.

**Importante:** se você tiver uma conta com ativação legítima na PSN (registrada oficialmente na PlayStation Network), **não** poderá usá-la diretamente com o Y2JB. Você deve criar e usar uma conta separada, com ativação fake.

**Para ativar uma conta como fake:**
1. Crie uma nova conta offline no seu PS5
2. Enquanto estiver conectado a essa nova conta, abra o **etaHEN toolbox**
3. Acesse o menu **"Remote Play"**
4. A conta será ativada automaticamente como fake

### PS5 com jailbreak

1. Instale o PKG do app YouTube no seu PS5
2. Baixe o `download0.dat` na página de releases.
3. Transfira o `download0.dat` com o [Prospero Manager](https://github.com/notmaj0r/ProsperoMgr), [FTP](https://github.com/ps5-payload-dev/ftpsrv) ou qualquer gerenciador de arquivos para o caminho correspondente ao TITLE ID do seu app do YouTube (crie a pasta se ela não existir):
   ```
   /user/download/PPSA01650
   /user/download/PPSA01651
   /user/download/PPSA01652
   ```
   Você só precisa usar um caminho. Escolha o que corresponde ao TITLE ID do seu app do YouTube.

### PS5 sem jailbreak

1. Baixe o arquivo de backup na página de releases  
**Firmware 4.03 – 12.40** → `Y2JB_backup_1.6(4.03)`  
**Firmware 12.60 ou superior** → `Y2JB_backup_1.6(12.20)`  
2. Siga o guia oficial da Sony para [restaurar dados de backup via USB](https://www.playstation.com/en-gb/support/hardware/back-up-ps5-data-USB/)

**⚠️ AVISO:** restaurar o backup **VAI RESTAURAR O PS5 PARA OS PADRÕES DE FÁBRICA**. Todos os dados do console serão apagados.

### Bloqueando atualizações do YouTube (appinfo_editor.py)

**⚠️ AVISO CRÍTICO:** a corrupção do banco de dados pode resultar na exclusão de **TODOS os FPKGs instalados e dados de save** armazenados na memória interna. Antes de seguir esta seção, **faça backup dos seus saves** usando o recurso de backup e restauração integrado do PS5, em Configurações, para evitar perda de dados.

Este script impede que o app do YouTube seja atualizado caso você se conecte à internet por acidente. Permitir atualizações pode causar um softlock que impede o YouTube de abrir (veja a próxima seção para as instruções de correção).

**Passos:**
1. Após instalar o PKG do YouTube, obtenha `/system_data/priv/mms/appinfo.db` do seu PS5 usando FTP
2. Coloque o `appinfo.db` no mesmo diretório do `appinfo_editor.py`
3. Execute o script para modificar o `appinfo.db` e bloquear as atualizações do YouTube:
   ```
   python appinfo_editor.py
   ```
4. **Antes de substituir o arquivo** no seu PS5 (para evitar corrupção do banco de dados):
   - Feche o app do YouTube completamente
   - Acesse a página de Configurações
   - Confirme que nenhum pacote está sendo instalado ou atualizado no momento
5. Use o FTP para substituir `/system_data/priv/mms/appinfo.db` pela versão modificada
6. Se você não receber nenhuma notificação de corrupção do banco de dados, reinicie o seu PS5

### Como sair do softlock do YouTube
![youtube_softlock](https://github.com/user-attachments/assets/62012e7f-e004-4e20-8c18-bd7d0bbd72b1)

Este problema normalmente ocorre quando você se conecta à internet **antes** de definir o DNS 127.0.0.2 (mais comum em usuários de Wi-Fi).

**Passos para recuperação:**
1. Com o softlock ativo, conecte-se normalmente à internet, sem DNS personalizado
2. Abra o YouTube novamente e recuse o popup de atualização do software do sistema
3. O app do YouTube deve abrir normalmente agora
4. Execute o jailbreak e carregue o HEN
5. Defina o DNS como 127.0.0.2 novamente e desinstale o YouTube
6. Siga novamente as seções **PS5 com jailbreak** e **Bloqueando atualizações do YouTube (appinfo_editor.py)**
7. Reinicie o seu PS5. Pronto.

## Enviando payloads

**Observação:** o Remote JS Server nem sempre usa a porta 50000. Embora normalmente use a porta 50000 por padrão, às vezes pode usar outra porta. Isso é um comportamento normal, não um bug.

Você pode enviar payloads usando o `payload_sender.py` (requer Python).

**Uso:**
```
python payload_sender.py <host> <arquivo>
python payload_sender.py <host> <porta> <arquivo>
```

**Exemplos:**
```
python payload_sender.py 192.168.1.100 helloworld.js
python payload_sender.py 192.168.1.100 50000 helloworld.js
python payload_sender.py 192.168.1.100 9020 payload.bin
```

### Payload Lapse

**Compatibilidade de firmware:** funciona apenas até o firmware 10.01

Depois que o payload Lapse for executado com sucesso, você precisa enviar o HEN ou outro binário ELF para a porta **9021**. Você pode usar qualquer enviador de payload TCP, como:
- `netcat`
- `payload_sender.py`

**Exemplo:**
```
python payload_sender.py 192.168.1.100 9021 hen.bin
```

### Payload Relapse

**Compatibilidade de firmware:** funciona até o firmware 13.60
- Requer uma conexão de rede ativa (Wi-Fi ou Ethernet).

Depois que o payload Relapse for executado com sucesso, o elfldr começa a escutar na porta **9021**.

## Aviso legal

Esta ferramenta é fornecida como está, apenas para fins de pesquisa e desenvolvimento.  
Use por sua conta e risco.  
Os desenvolvedores não se responsabilizam por quaisquer danos, perda de dados ou consequências decorrentes do uso deste software.  
