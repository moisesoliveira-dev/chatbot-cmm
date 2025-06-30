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
}
