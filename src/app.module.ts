import * as LocalSession from 'telegraf-session-local';

import { AppService } from './app.service';
import { AppUpdate } from './app.update';
import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';

const sessions = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    TelegrafModule.forRoot({
      middlewares: [sessions.middleware()],
      token: '7144170007:AAE-I0GJq1Jc91OjZ9rAiezDaRIbid4L3Wo',
    }),
  ],
  providers: [AppService, AppUpdate],
})
export class AppModule {}
