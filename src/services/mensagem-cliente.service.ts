import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensagemCliente } from '../entities/mensagem-cliente.entity';

@Injectable()
export class MensagemClienteService {
  constructor(
    @InjectRepository(MensagemCliente)
    private mensagemRepository: Repository<MensagemCliente>,
  ) {}

  async findByContactId(contactId: number): Promise<MensagemCliente | null> {
    return await this.mensagemRepository.findOne({
      where: { contactid: contactId }
    });
  }

  async updateLastMessage(contactId: number, lastMessage: string): Promise<void> {
    await this.mensagemRepository.update(
      { contactid: contactId },
      { lastmessage: lastMessage }
    );
  }

  async updateClient(contactId: number, data: Partial<MensagemCliente>): Promise<void> {
    await this.mensagemRepository.update({ contactid: contactId }, data);
  }

  async createOrUpdate(data: Partial<MensagemCliente>): Promise<MensagemCliente> {
    if (!data.contactid) {
      throw new Error('ContactId is required');
    }
    
    const existing = await this.findByContactId(data.contactid);
    
    if (existing) {
      await this.mensagemRepository.update({ contactid: data.contactid }, data);
      return { ...existing, ...data };
    } else {
      return await this.mensagemRepository.save(data);
    }
  }

  async restartChatbot(contactId: number, ticketId: number): Promise<void> {
    await this.updateClient(contactId, {
      ticketid: ticketId,
      state: 1,
      fase_arquivos: 'projeto'
    });
  }
}
