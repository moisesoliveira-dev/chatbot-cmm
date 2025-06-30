import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevChatbotModule } from './modules/dev-chatbot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DevChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class DevAppModule {}
