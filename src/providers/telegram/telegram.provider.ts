export interface TelegramProvider {
  sendMessages(chatId: string, messages: string[]): Promise<void>;
}
