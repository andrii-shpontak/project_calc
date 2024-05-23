import { Action, Command, Hears, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';

import { AppService } from './app.service';
import { Context } from './context.interface';
import { confirmButtons, projectButtons } from './app.buttons';

interface Project {
  id: string;
  name: string;
  totalHours: number;
}

const projects: Project[] = [
  { id: 'pets', name: 'Pets life', totalHours: 0 },
  { id: 'ai', name: 'AI_consolidation', totalHours: 0 },
  { id: 'books', name: 'AI_books', totalHours: 0 },
  { id: 'ct', name: 'CT_booking', totalHours: 0 },
];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {
    this.setBotCommands();
  }

  private async setBotCommands() {
    await this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      { command: 'add_time', description: 'Add time to a project' },
      { command: 'get_projects', description: 'Get the list of projects' },
      { command: 'cancel', description: 'Cancel current action' },
    ]);
  }

  @Command('add_time')
  async startScheduler(ctx: Context) {
    ctx.session.type = 'add';
    await ctx.deleteMessage();
    await ctx.reply('Select the project to which you plan to add time', projectButtons());
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  @Action(/add_(.+)/)
  async onProjectSelect(callback) {
    const [, projectId] = callback.match;

    // (ctx: Context) {
    //   if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    //     const action = ctx.callbackQuery.data.split('_')[1];

    const project = projects.find((p) => p.id === projectId);

    if (!!project) {
      callback.session.inProcess = project.name;
      await callback.reply(
        `How much time did you spend on ${project.name} project today?\nOnly numerical values with a range of 0.5 are accepted`,
      );
    } else {
      await callback.reply('Project not found. Please try again.');
    }
  }

  @Hears(/^\d+(\.\d+)?$/)
  async onTimeEntered(ctx: Context) {
    if (!('text' in ctx.message)) return;
    const hours = Number(ctx.message.text);

    const { type, inProcess } = ctx.session;

    switch (true) {
      case !type:
        ctx.replyWithHTML(`❌ <b>Action type is not selected!</b>`);
        break;
      case !inProcess:
        ctx.replyWithHTML(`❌ <b>Project is not selected!</b>`);
        break;
      case hours % 0.5 !== 0:
        ctx.replyWithHTML(`❌ <b>The number must be a multiple of 0.5!</b>`);
        break;
      default:
        ctx.session.hours = hours;
        ctx.session.lastInteraction = 'confirmation';
        await ctx.reply(
          `Add ${hours} hours to the ${inProcess} project.\nIs everything correct?`,
          confirmButtons(),
        );
    }
  }

  // Обробка колбеків з префіксом 'cnf_'
  @Action(/^cnf_(.+)/)
  async onConfirmAction(ctx: Context) {
    await ctx.answerCbQuery('Processing...');
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      const action = ctx.callbackQuery.data.split('_')[1];
      const project = projects.find((proj) => proj.name === ctx.session.inProcess);
      switch (action) {
        case 'confirm':
          console.log(project);
          project.totalHours += ctx.session.hours;
          await ctx.reply('Action confirmed!');
          break;
        case 'repeat':
          ctx.session = { type: 'add' };
          await ctx.reply('Select the project to which you plan to add time', projectButtons());
          break;
        case 'cancel':
          ctx.session = {};
          await ctx.reply('Action canceled.');
          break;
        default:
          await ctx.reply('Unknown action.');
          break;
      }
    }
  }

  @Hears('🗒 Get projects list')
  async getProjectList(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.replyWithHTML(
      `<b>Project list:</b> \n\n${projects.map((project, i) => ++i + ' ' + project.name + ' : ' + project.totalHours + '\n').join('')}`,
    );
  }
  // @Hears(/^\d+(\.\d+)?$/)
  // async onTimeEntered(ctx: Context) {
  //   const time = 1;
  //   const projectId = ctx.session.inProcess;
  //   // const project = projects.find((p) => p.id === projectId);

  //   // if (!project) {
  //   //   await ctx.reply('Project not found. Please start again.');
  //   //   return;
  //   // }

  //   if (isNaN(time) || time <= 0 || time % 0.5 !== 0) {
  //     await ctx.reply('Invalid time. Please enter a valid number with a range of 0.5.');
  //     return;
  //   }

  //   // await ctx.reply(
  //   //   `You entered ${time} hours for ${project.name}. Is this correct?`,
  //   //   Markup.inlineKeyboard([
  //   //     Markup.button.callback('Yes', `confirm_${projectId}_${time}`),
  //   //     Markup.button.callback('No', 'retry'),
  //   //   ]),
  //   // );
  // }

  @Action(/confirm_(.+)_(.+)/)
  async onConfirm(ctx: Context) {
    // const [projectId, time] = ctx.message.split('_');
    // const project = projects.find((p) => p.id === projectId);
    // if (project) {
    //   project.totalHours += parseFloat(time);
    //   await ctx.reply(`Added ${time} hours to ${project.name}.`);
    // } else {
    //   await ctx.reply('Project not found. Please start again.');
    // }
    // ctx.session.inProcess = null;
  }

  @Action('retry')
  async onRetry(ctx: Context) {
    await ctx.reply('Please enter the time again.');
  }

  @Action('cancel')
  async onCancel(ctx: Context) {
    ctx.session.inProcess = null;
    await ctx.reply('Selection canceled.');
  }
}
