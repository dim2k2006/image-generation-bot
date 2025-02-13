import { Bot, Context, NextFunction } from 'grammy';
import { Container } from '../container';

function buildBot(container: Container) {
  const bot = new Bot(container.config.telegramBotToken);

  bot.command('start', auth, async (ctx) => {
    const externalId = ctx.from.id.toString();

    const isUserExist = await container.userService.isUserExist(externalId);

    if (!isUserExist) {
      await ctx.reply('Please register first using /register command');

      return;
    }

    const user = await container.userService.getUserByIdOrExternalId(externalId);

    await ctx.reply(`Hello, ${user.firstName}! Welcome! 🧙‍♂️`);
  });

  bot.command('register', auth, async (ctx) => {
    const externalId = ctx.from.id.toString();

    const isUserExist = await container.userService.isUserExist(externalId);

    if (isUserExist) {
      await ctx.reply('You are already registered!');

      return;
    }

    const firstName = ctx.from.first_name;
    const lastName = ctx.from.last_name;

    await container.userService.createUser({ externalId, firstName, lastName });

    await ctx.reply('You have been successfully registered!');
  });

  bot.on('message:text', auth, async (ctx) => {
    const externalId = ctx.from.id.toString();

    const isUserExist = await container.userService.isUserExist(externalId);

    if (!isUserExist) {
      await ctx.reply('Please register first using /register command');

      return;
    }

    const user = await container.userService.getUserByIdOrExternalId(ctx.from.id.toString());

    const message = ctx.message.text;

    if (!message) {
      await ctx.reply('I do not understand what you are saying. 😔');

      return;
    }

    await container.generatedImageService.createImage({
      prompt: message,
      isPromptEnhanced: false,
      style: 'photo',
      orientation: 'vertical',
      userId: user.id,
    });

    await ctx.reply('Your image is being generated. Please wait for a while. 🧙‍♂️');
  });

  return bot;

  async function auth(ctx: Context, next: NextFunction): Promise<void> {
    if (!ctx.from) {
      await ctx.reply('You are not allowed to use this command.');

      return;
    }

    if (!container.config.allowedTelegramUserIds.includes(ctx.from.id)) {
      await ctx.reply('You are not allowed to use this command.');

      return;
    }

    await next();
  }
}

export default buildBot;
