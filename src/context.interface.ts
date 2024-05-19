import { Context as ContextTelegraf } from 'telegraf';

export interface Context extends ContextTelegraf {
  session: {
    type?: 'add' | 'edit' | 'remove';
    inProcess?: string;
  };
}
