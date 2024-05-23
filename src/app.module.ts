import * as LocalSession from 'telegraf-session-local';

import { AppService } from './app.service';
import { AppUpdate } from './app.update';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
