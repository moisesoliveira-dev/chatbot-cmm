import { Injectable } from '@nestjs/common';
import { MensagemCliente } from '../entities/mensagem-cliente.entity';

// Mock Database Service para desenvolvimento sem PostgreSQL
@Injectable()
export class MockMensagemClienteService {
  private store = new Map<number, MensagemCliente>();

  async findByContactId(contactId: number): Promise<MensagemCliente | null> {
    const result = this.store.get(contactId) || null;
    console.log(`Mock DB SELECT contactid=${contactId}:`, result);
    return result;
  }

  async updateLastMessage(contactId: number, lastMessage: string): Promise<void> {
    const existing = this.store.get(contactId);
    if (existing) {
      existing.lastmessage = lastMessage;
      console.log(`Mock DB UPDATE lastmessage for contactid=${contactId}: ${lastMessage}`);
    }
  }

  async updateClient(contactId: number, data: Partial<MensagemCliente>): Promise<void> {
    const existing = this.store.get(contactId);
    if (existing) {
      Object.assign(existing, data);
      console.log(`Mock DB UPDATE for contactid=${contactId}:`, data);
    }
  }

  async createOrUpdate(data: Partial<MensagemCliente>): Promise<MensagemCliente> {
    if (!data.contactid) {
      throw new Error('ContactId is required');
    }
    
    const existing = this.store.get(data.contactid);
    
    if (existing) {
      Object.assign(existing, data);
      console.log(`Mock DB UPDATE contactid=${data.contactid}:`, data);
      return existing;
    } else {
      const newRecord: MensagemCliente = {
        id: Date.now(), // Mock ID
        contactid: data.contactid,
        ticketid: data.ticketid || 0,
        ematendimento: false,
        finalizoutriagem: false,
        stopchatbot: false,
        pararmensagem: false,
        state: 1,
        ...data
      };
      this.store.set(data.contactid, newRecord);
      console.log(`Mock DB INSERT contactid=${data.contactid}:`, newRecord);
      return newRecord;
    }
  }

  async restartChatbot(contactId: number, ticketId: number): Promise<void> {
    await this.updateClient(contactId, {
      ticketid: ticketId,
      state: 1,
      fase_arquivos: 'projeto'
    });
    console.log(`Mock DB RESTART chatbot for contactid=${contactId}, ticketid=${ticketId}`);
  }

  /**
   * Verifica se é um cliente novo baseado na data de criação do ticket
   * Um cliente é considerado novo se o ticket foi criado no mesmo dia
   */
  isNewClient(ticketCreatedAt: string): boolean {
    const createdAt = new Date(ticketCreatedAt);
    
    // Ajusta o horário para UTC-4 (Manaus)
    const manausOffsetMs = 4 * 60 * 60 * 1000;
    const createdManaus = new Date(createdAt.getTime() - manausOffsetMs);
    
    const nowUtc = new Date();
    const nowManaus = new Date(nowUtc.getTime() - manausOffsetMs);
    
    // Compara apenas ano, mês e dia
    const isSameDay =
        createdManaus.getFullYear() === nowManaus.getFullYear() &&
        createdManaus.getMonth() === nowManaus.getMonth() &&
        createdManaus.getDate() === nowManaus.getDate();
    
    console.log(`Mock CHECK isNewClient for ticket created at ${ticketCreatedAt}: ${isSameDay}`);
    return isSameDay;
  }

  /**
   * Processa o primeiro contato de um cliente
   * Equivale ao workflow "Primeiro_contato.json"
   */
  async processFirstContact(contactId: number, ticketId: number): Promise<MensagemCliente> {
    // Dados para o primeiro contato (equivale ao "Dados armazenar arquivos2")
    const firstContactData: Partial<MensagemCliente> = {
      contactid: contactId,
      ticketid: ticketId,
      state: 1, // Estado inicial
      fase_arquivos: 'projeto' // Fase inicial
    };

    // Upsert no banco (equivale ao upsert do Primeiro_contato.json)
    const client = await this.createOrUpdate(firstContactData);

    // Atualizar última mensagem para indicar início do atendimento
    await this.updateLastMessage(contactId, 'Primeiro contato - Atendimento iniciado');

    console.log(`Mock DB FIRST CONTACT processed for contactid=${contactId}, ticketid=${ticketId}`);
    return client;
  }
}
