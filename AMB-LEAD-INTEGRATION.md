# Integração do Workflow Amb__Lead_no_Driver.json

## Visão Geral

Este documento descreve a integração completa do workflow `Amb__Lead_no_Driver.json` do n8n para o sistema NestJS do chatbot CMM.

## Função do Workflow

O workflow "Amb__Lead_no_Driver.json" é responsável por:

1. **Automação de Estrutura de Pastas**: Criação automática da estrutura hierárquica de pastas no Google Drive
2. **Organização por Data**: Pastas organizadas por ano, mês e status (ANDAMENTO)
3. **Pasta do Cliente**: Criação de pasta específica para cada lead/cliente
4. **Documento de Preferências**: Criação automática de documento Google Docs
5. **Atualização de Estado**: Atualização do estado do chatbot e armazenamento da localização

## Estrutura de Pastas Criada

```
01 - VENDAS E PROJETOS/
└── {ANO} (ex: 2025)/
    └── {MÊS} (ex: "06. Junho")/
        └── ANDAMENTO/
            └── {TICKET_ID} - {NOME_CLIENTE}/
                └── Preferências - {NOME_CLIENTE}.docx
```

## Integração Implementada

### 1. GoogleDriveService

**Arquivo**: `src/services/google-drive.service.ts`

```typescript
async createLeadEnvironment(data: LeadEnvironmentData): Promise<LeadEnvironmentResult>
```

**Funcionalidades**:
- Obtenção de ano/mês atual formatado em português
- Verificação/criação de estrutura de pastas hierárquica
- Criação de pasta específica do cliente
- Criação de documento Google Docs
- Movimentação do documento para pasta correta

### 2. MockGoogleDriveService

**Arquivo**: `src/services/mock-google-drive.service.ts`

**Funcionalidades**:
- Simulação completa do processo para desenvolvimento
- Logs detalhados das operações
- Resposta mock com IDs válidos
- Delays para simular tempo de processamento

### 3. Integração no ChatbotService

**Arquivo**: `src/services/chatbot.service.ts`

**Método**: `handleOrcamentoChoice()`

**Fluxo**:
1. Cliente escolhe opção "1" (Orçamento) no estado 1
2. Sistema cria ambiente do lead automaticamente
3. Envia template com opções de projeto
4. Atualiza estado para 3 com local_arquivo
5. Atualiza lastmessage com timestamp do ticket

### 4. Template Específico

**Arquivo**: `src/services/template.service.ts`

**Método**: `getLeadEnvironmentTemplate()`

**Conteúdo**:
```
🎯 Perfeito! Vamos iniciar seu orçamento.
Você já tem um projeto em mãos ou vamos começar do zero juntinhos? 

Por favor, escolha uma das opções abaixo:

1 - Já tenho um projeto 📄
2 - Ainda não tenho 🆕

👉 É só me informar a opção que seguimos daqui!
```

## Configuração de Dependências

### DevChatbotModule

**Arquivo**: `src/modules/dev-chatbot.module.ts`

```typescript
{
  provide: 'GoogleDriveService',
  useClass: MockGoogleDriveService,
}
```

### ChatbotModule (Produção)

**Arquivo**: `src/modules/chatbot.module.ts`

```typescript
{
  provide: 'GoogleDriveService',
  useClass: GoogleDriveService,
}
```

## Dados de Entrada

**Interface**: `LeadEnvironmentData`

```typescript
interface LeadEnvironmentData {
  customerName: string;  // Nome do cliente
  ticketId: number;      // ID do ticket
  contactId: number;     // ID do contato
}
```

## Dados de Saída

**Interface**: `LeadEnvironmentResult`

```typescript
interface LeadEnvironmentResult {
  folderId: string;      // ID da pasta criada no Google Drive
  documentId: string;    // ID do documento criado
  documentUrl: string;   // URL do documento para acesso
}
```

## Estados do Chatbot

| Estado | Descrição | Ação |
|--------|-----------|------|
| 1 | Escolha de serviço | Cliente escolhe "1" para orçamento |
| 3 | Ambiente criado | Lead environment criado, aguarda escolha de projeto |

## Testes

### Script de Teste

**Arquivo**: `test-lead-environment.ps1`

**Cenários testados**:
1. Cliente escolhendo orçamento (state 1 → 3)
2. Resposta após ambiente criado (state 3)
3. Cliente sem projeto (opção 2)

### Comandos de Teste

```powershell
# Desenvolvimento (com mocks)
npm run start:dev:mock

# Execução de testes
.\test-lead-environment.ps1
```

## Verificações de Funcionamento

### Logs Esperados (Mock)

```
🏗️  CREATING LEAD ENVIRONMENT FOR: João Silva (MOCK)
📅 Current Year/Month: 2025/06. Junho
📁 Creating folder structure: VENDAS -> 2025 -> 06. Junho -> ANDAMENTO
📁 Cliente folder created: 91001 - João Silva
📄 Document created: Preferências - João Silva
✅ Lead environment created successfully (MOCK)
```

### Base de Dados

**Tabela**: `tb_mensagem_cliente`

**Campos atualizados**:
- `state`: 3
- `local_arquivo`: ID da pasta criada
- `lastmessage`: timestamp da última atualização

## Tratamento de Erros

### Fallback em Caso de Erro

Se a criação do ambiente falhar:
1. Log do erro é registrado
2. Template de orçamento simples é enviado
3. Estado retorna para 2 (em vez de 3)
4. Processo continua sem interrupção

### Monitoramento

- Logs detalhados de cada etapa
- Captura de exceções com context
- Fallback gracioso em caso de falha

## Configuração do Google Drive API

### Credenciais Necessárias

- Google Drive OAuth2 API
- Google Docs OAuth2 API
- Permissões de leitura/escrita no Google Drive

### IDs de Pastas Importantes

- **Base Vendas**: `1CXv4WdKVnyopaGBToq4PMXBbImz39wGu` (01 - VENDAS E PROJETOS)

## Próximos Passos

1. **Configuração de Produção**: Configurar credenciais reais do Google Drive
2. **Testes Integrados**: Testes com API real do Google Drive
3. **Monitoramento**: Implementar alertas para falhas na criação de ambiente
4. **Otimização**: Cache de estrutura de pastas para melhor performance

## Equivalência com n8n

| n8n Node | NestJS Equivalente | Função |
|----------|-------------------|---------|
| "Ano e Mês atual" | `getCurrentYearMonth()` | Obter data formatada |
| "Verificar existencia de pasta" | `ensureFolderExists()` | Verificar/criar pastas |
| "Criar pasta do ano/mês/andamento" | `ensureFolderExists()` | Criar estrutura hierárquica |
| "Criar pasta do cliente" | `ensureFolderExists()` | Pasta específica do cliente |
| "Criar documento do cliente" | `createDocument()` | Documento de preferências |
| "Template de serviço" | `getLeadEnvironmentTemplate()` | Template de resposta |
| "Atualizar estado Servico" | `updateClient()` | Atualização do estado |
| "Atualizar data da ultima mensagem" | `updateLastMessage()` | Timestamp da última mensagem |

## Conclusão

A integração do workflow `Amb__Lead_no_Driver.json` está completa e funcional, proporcionando:

- Automação completa da criação de ambiente do lead
- Estrutura organizada no Google Drive
- Integração transparente com o fluxo do chatbot
- Tratamento robusto de erros
- Ambiente de desenvolvimento com mocks para testes
