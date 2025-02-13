export interface ChatProvider {
  sendMessages(chatId: string, messages: string[]): Promise<void>;
}
