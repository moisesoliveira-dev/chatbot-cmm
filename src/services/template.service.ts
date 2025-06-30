import { Injectable } from '@nestjs/common';
import { MessageTemplate } from '../interfaces/api.interfaces';

@Injectable()
export class TemplateService {
  getReconnectionTemplate(): MessageTemplate {
    return {
      body: `⏳ Como houve uma pausa no atendimento, vamos reiniciar o processo para garantir que tudo ocorra da melhor forma possível. 😊

📋 Fique tranquilo(a), vamos retomar desde o início para garantir que nenhuma informação importante seja perdida!`
    };
  }

  getProjectTemplate(): MessageTemplate {
    return {
      body: `📂 Perfeito! Isso vai agilizar bastante o nosso processo.
Você pode me enviar os arquivos do seu projeto, como:

📄 Planta baixa
🖼️ Imagens
📑 Outros documentos que ajudem nossa equipe a entender melhor o espaço.

Assim, conseguimos preparar um orçamento ainda mais preciso pra você!

Quando finalizar o envio mande um "OK" 😊`
    };
  }

  getFloorPlanTemplate(): MessageTemplate {
    return {
      body: `📏 Sem problemas, a gente te ajuda desde o comecinho!
Você tem as medidas do ambiente ou uma planta baixa simples com as dimensões? Já é o suficiente pra começarmos a montar algo para você. 😄

1 - Tenho as medidas 📐
2 - Não tenho as medidas ❌`
    };
  }

  getHasFloorPlanTemplate(): MessageTemplate {
    return {
      body: `📄 Perfeito!
Com as medidas da planta baixa em mãos, vamos poder avançar para criar um orçamento bem detalhado e personalizado para você. Agora precisamos que envie o documento com as medidas.

📤 Você pode enviar por aqui mesmo.

Quando finalizar o envio mande um "OK"`
    };
  }
}
