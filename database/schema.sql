-- Criação da tabela tb_mensagem_cliente
-- Baseada na estrutura do n8n original

CREATE TABLE IF NOT EXISTS tb_mensagem_cliente (
    id SERIAL PRIMARY KEY,
    mediapath VARCHAR(500),
    body TEXT,
    mediatype VARCHAR(50),
    ticketid INTEGER NOT NULL,
    contactid INTEGER NOT NULL,
    userid INTEGER,
    lastmessageat TIMESTAMP,
    nome VARCHAR(255),
    ematendimento BOOLEAN DEFAULT FALSE,
    finalizoutriagem BOOLEAN DEFAULT FALSE,
    stopchatbot BOOLEAN DEFAULT FALSE,
    templateid INTEGER,
    pararmensagem BOOLEAN DEFAULT FALSE,
    lastmessage VARCHAR(255),
    state INTEGER DEFAULT 1,
    fase_arquivos VARCHAR(100),
    local_arquivo VARCHAR(500),
    id_atendente VARCHAR(100),
    data_medicao VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_mensagem_cliente_contactid ON tb_mensagem_cliente(contactid);
CREATE INDEX IF NOT EXISTS idx_mensagem_cliente_ticketid ON tb_mensagem_cliente(ticketid);
CREATE INDEX IF NOT EXISTS idx_mensagem_cliente_state ON tb_mensagem_cliente(state);

-- Comentários para documentação
COMMENT ON TABLE tb_mensagem_cliente IS 'Tabela que armazena informações sobre mensagens e estados dos clientes no chatbot';
COMMENT ON COLUMN tb_mensagem_cliente.contactid IS 'ID do contato no sistema de mensagens';
COMMENT ON COLUMN tb_mensagem_cliente.ticketid IS 'ID do ticket de atendimento';
COMMENT ON COLUMN tb_mensagem_cliente.state IS 'Estado atual do cliente no fluxo do chatbot (1-11)';
COMMENT ON COLUMN tb_mensagem_cliente.fase_arquivos IS 'Fase atual do envio de arquivos (projeto, plantabaixa, etc)';
COMMENT ON COLUMN tb_mensagem_cliente.ematendimento IS 'Indica se o cliente está em atendimento pessoal';
COMMENT ON COLUMN tb_mensagem_cliente.lastmessage IS 'Data/hora da última mensagem para controle de tempo';
