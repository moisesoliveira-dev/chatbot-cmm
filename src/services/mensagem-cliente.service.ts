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

    return client;
  }
}
