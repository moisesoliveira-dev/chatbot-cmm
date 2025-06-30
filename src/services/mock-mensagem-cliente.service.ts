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
}
