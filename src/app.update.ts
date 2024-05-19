import { AppService } from './app.service';
import { Action, Command, Hears, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { actionButtons, projectButtons } from './app.buttons';
import { Context } from './context.interface';

interface Project {
  id: string;
  name: string;
  totalHours: number;
}

const projects: Project[] = [
  { id: 'pest', name: 'Pets life', totalHours: 0 },
  { id: 'ai', name: 'AI_consolidation', totalHours: 0 },
  { id: 'books', name: 'AI_books', totalHours: 0 },
  { id: 'ct', name: 'CT_booking', totalHours: 0 },
];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply('Hi! ✋');
    await ctx.reply('What can i help you?', actionButtons());
  }

  @Command('add_time')
  async startScheduler(ctx: Context) {
    ctx.session.type = 'add';
    await ctx.deleteMessage();
    await ctx.reply('Select the project to which you plan to add time', projectButtons());
  }

  @Hears('🗒 Get projects list')
  async getProjectList(ctx: Context) {
    await ctx.deleteMessage();
    await ctx.replyWithHTML(
      `<b>Project list:</b> \n\n${projects.map((project, i) => ++i + ' ' + project.name + ' : ' + project.totalHours + '\n').join('')}`,
    );
  }

  @Action(/add_(.+)/)
  async onProjectSelect(callback) {
    const [, projectId] = callback.match;

    callback.session.inProcess = projectId;
    // await ctx.deleteMessage();
    // const project = projects.find((p) => p.id === projectId);
    // if (project) {
    //   await ctx.reply(
    //     `How much time did you spend on ${project.name} project today?\nOnly numerical values with a range of 0.5 are accepted`,
    //   );
    // } else {
    //   await ctx.reply('Project not found. Please try again.');
    // }
  }

  @Hears(/^\d+(\.\d+)?$/)
  async onTimeEntered(ctx: Context) {
    const time = 1;
    const projectId = ctx.session.inProcess;
    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      await ctx.reply('Project not found. Please start again.');
      return;
    }

    if (isNaN(time) || time <= 0 || time % 0.5 !== 0) {
      await ctx.reply('Invalid time. Please enter a valid number with a range of 0.5.');
      return;
    }

    await ctx.reply(
      `You entered ${time} hours for ${project.name}. Is this correct?`,
      Markup.inlineKeyboard([
        Markup.button.callback('Yes', `confirm_${projectId}_${time}`),
        Markup.button.callback('No', 'retry'),
      ]),
    );
  }

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
