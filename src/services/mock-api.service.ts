import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MessageTemplate, TicketApiResponse } from '../interfaces/api.interfaces';

// Mock API Service para desenvolvimento sem API externa
@Injectable()
export class MockApiService {
  private readonly baseUrl = 'https://cmmodulados.gosac.com.br/api';

  async sendMessage(ticketId: number, message: MessageTemplate): Promise<void> {
    // Simula envio de mensagem
    console.log(`🤖 SENDING MESSAGE TO TICKET ${ticketId}:`);
    console.log(`📱 Message: ${message.body}`);
    console.log(`✅ Message sent successfully (MOCK)`);
    
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async getTicket(ticketId: number): Promise<TicketApiResponse> {
    // Simula busca de ticket
    console.log(`🎫 GETTING TICKET ${ticketId} (MOCK)`);
    
    const mockResponse: TicketApiResponse = {
      ticketId: ticketId,
      contactId: 123456,
      updatedAt: new Date().toISOString(),
      status: 'open'
    };
    
    console.log(`✅ Ticket retrieved:`, mockResponse);
    return mockResponse;
  }
}
