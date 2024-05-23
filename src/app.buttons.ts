import { Markup } from 'telegraf';

export function actionButtons() {
  return Markup.keyboard(
    ['🗒 Get projects list', '✏️ Edit projects list', '❌ Remove project from list'],
    { columns: 3 },
  );
}

export function projectButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('Pets Life', 'add_pets'),
      Markup.button.callback('AI-consolidation', 'add_ai'),
      Markup.button.callback('AI-books', 'add_books'),
      Markup.button.callback('CT-booking', 'add_ct'),
    ],
    { columns: 2 },
  );
}

export function confirmButtons() {
  return Markup.inlineKeyboard(
    [
      Markup.button.callback('✅ Confirm', 'cnf_confirm'),
      Markup.button.callback('🔄 Repeat', 'cnf_repeat'),
      Markup.button.callback('❌ Cancel', 'cnf_cancel'),
    ],
    { columns: 3 },
  );
}
