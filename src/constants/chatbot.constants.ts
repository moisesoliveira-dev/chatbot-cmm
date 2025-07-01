/**
 * Constantes do sistema de chatbot
 */

export const CHATBOT_CONSTANTS = {
  // Estados do cliente
  STATES: {
    INITIAL: 1,
    BUDGET_QUESTION: 2,
    LEAD_ENVIRONMENT: 3,
    FILE_UPLOAD: 4,
    FLOOR_PLAN_QUESTION: 5,
    PROJECT_FINALIZED: 6,
    MEASUREMENT_SCHEDULING: 7,
  },

  // Tipos de mídia inválidos
  INVALID_MEDIA_TYPES: [
    'hsm', 
    'transfer', 
    'ptt', 
    'sticker', 
    'vcard', 
    'location', 
    'impostor'
  ],

  // Tipos de mídia válidos para armazenamento
  VALID_MEDIA_TYPES: [
    'image', 
    'video', 
    'audio', 
    'document', 
    'application'
  ],

  // Configurações de tempo
  TIMING: {
    DEBOUNCE_DELAY: 3000, // 3 segundos
    ONE_HOUR_MS: 3600000, // 1 hora em milissegundos
  },

  // IDs de usuários para redirecionamento
  USER_IDS: {
    PROJETO_EXECUTIVO: 6,
    ASSISTENCIA_TECNICA: 58,
    FINANCEIRO: 49,
  },

  // Chaves do Redis
  REDIS_KEYS: {
    LAST_MESSAGE: 'chatbot:last:user:',
  },

  // Fases de arquivos
  FILE_PHASES: {
    PROJETO: 'projeto',
    PLANTA_BAIXA: 'plantabaixa',
  },

  // Status de ticket
  TICKET_STATUS: {
    PENDING: 'pending',
    OPEN: 'open',
    CLOSED: 'closed',
  },
};

export const CHATBOT_MESSAGES = {
  VALIDATION: {
    WEBHOOK_DATA_MISSING: '❌ Dados de webhook ausentes',
    CONTACT_ID_MISSING: '❌ ContactId ou TicketId ausentes',
    CONTACT_DATA_MISSING: '❌ Dados do contato ausentes',
    INVALID_STATE: '❌ Estado inválido para cliente',
    INVALID_INPUT: '❌ Entrada inválida no estado',
  },

  INFO: {
    MEDIA_TYPE_IGNORED: '⏭️ Tipo de mídia ignorado',
    BOT_MESSAGE_IGNORED: '⏭️ Mensagem enviada pelo bot ignorada',
    GROUP_MESSAGE_IGNORED: '⏭️ Mensagem de grupo ignorada',
    DUPLICATE_MESSAGE_IGNORED: '⏭️ Mensagem duplicada ignorada',
    CHATBOT_PAUSED: '⏹️ Chatbot pausado para cliente',
    INVALID_OPTION: '⚠️ Opção inválida escolhida no estado',
  },

  SUCCESS: {
    FIRST_CONTACT_PROCESSED: '✅ Primeiro contato processado para cliente',
    FILE_STORED: '✅ Arquivo armazenado com sucesso',
    LEAD_ENVIRONMENT_CREATED: '✅ Ambiente do lead criado para cliente',
  },

  ERROR: {
    CRITICAL_WEBHOOK: '❌ Erro crítico no processamento do webhook',
    NOTIFICATION_FAILED: '❌ Falha ao notificar erro para o cliente',
    FIRST_CONTACT_ERROR: '❌ Erro ao processar primeiro contato',
    FALLBACK_ERROR: '❌ Erro crítico no fallback do primeiro contato',
    FILE_STORAGE_ERROR: '❌ Erro ao armazenar arquivo',
    MEDIA_PROCESSING_ERROR: '❌ Erro ao processar arquivo de mídia',
    SEND_ERROR: '❌ Erro ao enviar mensagem de erro',
  },
};
