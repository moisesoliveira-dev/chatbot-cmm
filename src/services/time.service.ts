import { Injectable } from '@nestjs/common';
import { TimeComparison } from '../interfaces/api.interfaces';

@Injectable()
export class TimeService {
  compareTime(lastMessageDate: string): TimeComparison {
    // Data fornecida no item
    const inputDate = new Date(lastMessageDate);
    
    // Pega a hora atual de Manaus (UTC-4)
    const now = new Date();
    const nowManaus = new Date(now.getTime());
    
    // Calcula diferença em milissegundos
    const diffMs = Math.abs(nowManaus.getTime() - inputDate.getTime());
    const diffMinutes = diffMs / (1000 * 60);
    
    // Retorna resultado com detalhes
    return {
      inputDate: inputDate.toISOString(),
      currentDateManaus: nowManaus.toISOString(),
      differenceInMinutes: diffMinutes,
      passedOneHour: diffMinutes > 60
    };
  }

  /**
   * Obtém ano e mês atual formatados em português
   */
  getCurrentYearMonth(): { year: string; month: string } {
    const now = new Date();
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];

    const year = now.getFullYear().toString();
    const monthName = meses[now.getMonth()];

    return { year, month: monthName };
  }
}
