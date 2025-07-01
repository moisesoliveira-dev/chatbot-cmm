# INTEGRAÇÃO DO WORKFLOW ARMAZENAR_ARQUIVOS.JSON

Este documento detalha a integração do workflow n8n "Armazenar_arquivos.json" para o sistema NestJS.

## 📋 RESUMO DO WORKFLOW

O workflow "Armazenar_arquivos.json" é responsável por:
1. Receber arquivos de mídia enviados via WhatsApp
2. Baixar os arquivos da API do WhatsApp
3. Navegar pela estrutura de pastas no Google Drive (Ano/Mês/Andamento/Cliente)
4. Fazer upload do arquivo para a pasta do cliente
5. Atualizar a última mensagem no banco de dados

## 🔄 FLUXO DE DADOS

### Entrada (pinData):
```json
{
  "id": 311,
  "mediaPath": "https://cmmodulados.gosac.com.br/api/public/16311_1750986607800/16311_1750986607800.jpeg",
  "body": "",
  "mediaType": "image",
  "ticketId": 16311,
  "contactId": 24914,
  "userId": 45,
  "nome": "Moisés Seixas",
  "emAtendimento": false,
  "finalizoutriagem": false,
  "stopchatbot": false,
  "templateId": null,
  "pararmensagem": true,
  "lastmessage": "2025-06-27T01:09:14.480Z",
  "state": 4,
  "fase_arquivos": "projeto"
}
```

### Saída:
- Arquivo armazenado no Google Drive
- Última mensagem atualizada no banco
- Confirmação enviada para o cliente

## 🏗️ ARQUITETURA DA INTEGRAÇÃO

### 1. Interfaces Criadas

**`FileStorageData`** - Dados de entrada do arquivo
**`FileStorageResult`** - Resultado do processamento
**`FileDownloadResult`** - Resultado do download
**`FileMetadata`** - Metadados do arquivo
**`StorageLocation`** - Localização no Google Drive

### 2. Serviços Implementados

**`FileStorageService`** - Serviço principal
- `processFileStorage()` - Processa armazenamento completo
- `downloadWhatsAppFile()` - Baixa arquivo do WhatsApp
- `uploadToGoogleDrive()` - Faz upload para Google Drive
- `getStorageLocation()` - Navega estrutura de pastas

**`MockFileStorageService`** - Mock para desenvolvimento
- Simula todo o processo sem dependências externas
- Logs detalhados para debugging

### 3. Integração no ChatbotService

**Novos métodos:**
- `isMediaFile()` - Verifica se mensagem contém arquivo
- `processMediaFile()` - Processa arquivo completo

**Fluxo integrado:**
1. Webhook recebido → Validação
2. Se contém arquivo → `processMediaFile()`
3. Download + Upload + Confirmação
4. Continua processamento normal

### 4. Templates Adicionados

**`getFileStorageConfirmationTemplate()`** - Confirmação de sucesso
**`getFileStorageErrorTemplate()`** - Mensagem de erro

## 🔧 MAPEAMENTO N8N → NESTJS

| Nó N8N | Método NestJS | Função |
|--------|---------------|---------|
| "When Executed by Another Workflow" | `processMediaFile()` | Recebe dados do arquivo |
| "Ano e Mês" | `timeService.getCurrentYearMonth()` | Obter data atual |
| "Buscar pasta ano" | `findOrCreateFolder()` | Navegar estrutura |
| "Buscar pasta mês" | `findOrCreateFolder()` | Navegar estrutura |
| "Buscar pasta andamento" | `findOrCreateFolder()` | Navegar estrutura |
| "Buscar pasta cliente" | `findFolder()` | Encontrar pasta cliente |
| "Baixar arquivos whatsapp" | `downloadWhatsAppFile()` | Download do arquivo |
| "Adicionar projeto cliente" | `uploadToGoogleDrive()` | Upload para Drive |
| "Recuperar ticket2" | `apiService.getTicket()` | Buscar ticket atualizado |
| "Atualizar data da ultima mensagem2" | `updateLastMessage()` | Atualizar banco |

## 💻 IMPLEMENTAÇÃO

### Estrutura de Arquivos Criados:
```
src/
├── interfaces/
│   └── file-storage.interfaces.ts     # Interfaces do workflow
├── services/
│   ├── file-storage.service.ts        # Serviço principal
│   └── mock-file-storage.service.ts   # Mock para desenvolvimento
└── modules/
    ├── chatbot.module.ts              # Módulo produção (atualizado)
    └── dev-chatbot.module.ts          # Módulo desenvolvimento (atualizado)
```

### Arquivos Modificados:
- `chatbot.service.ts` - Integração principal
- `template.service.ts` - Novos templates
- `google-drive.service.ts` - Métodos de busca e upload
- `mock-google-drive.service.ts` - Mocks correspondentes
- `time.service.ts` - Método getCurrentYearMonth()

## 🧪 TESTES

### Script de Teste:
```powershell
.\test-file-storage.ps1
```

### Cenários Testados:
1. **Imagem JPEG** - Com descrição
2. **Documento PDF** - Com descrição
3. **Vídeo MP4** - Com descrição
4. **Imagem PNG** - Sem descrição

### Validações:
- ✅ Download de arquivos do WhatsApp
- ✅ Navegação na estrutura de pastas
- ✅ Upload para pasta correta
- ✅ Geração de nomes com cliente e descrição
- ✅ Envio de confirmação
- ✅ Tratamento de erros

## 🔥 FUNCIONALIDADES

### Tipos de Arquivo Suportados:
- **Imagens**: JPG, JPEG, PNG, GIF
- **Documentos**: PDF, DOC, DOCX
- **Vídeos**: MP4
- **Áudios**: MP3, WAV
- **Outros**: TXT, etc.

### Nomenclatura Inteligente:
- **Com descrição**: `{Cliente}_{Descrição}_{Timestamp}_{Arquivo}`
- **Sem descrição**: `{Cliente}_arquivo_{Timestamp}_{Arquivo}`

### Estrutura no Google Drive:
```
📁 01 - VENDAS E PROJETOS
  └── 📁 2025
      └── 📁 06. Junho
          └── 📁 ANDAMENTO
              └── 📁 16311 - Moisés Seixas
                  └── 📄 Moisés_Seixas_Foto_da_cozinha_atual_1719777600000_cozinha.jpeg
```

## 🎯 BENEFÍCIOS DA INTEGRAÇÃO

1. **Automação Completa** - Processo totalmente automatizado
2. **Organização Inteligente** - Estrutura hierárquica por data
3. **Nomenclatura Consistente** - Padrão de nomes organizado
4. **Tratamento de Erros** - Fallbacks e mensagens informativas
5. **Desenvolvimento Ágil** - Mocks para desenvolvimento local
6. **Escalabilidade** - Suporte a todos os tipos de arquivo
7. **Rastreabilidade** - Logs detalhados de todo o processo

## 🚀 EXECUÇÃO

### Desenvolvimento:
```bash
npm run start:dev:mock
```

### Produção:
```bash
npm run start:prod
```

### Teste Completo:
```powershell
.\test-file-storage.ps1
```

---

✅ **STATUS**: INTEGRAÇÃO COMPLETA E FUNCIONAL
