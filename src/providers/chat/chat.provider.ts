export interface ChatProvider {
  sendMessages(chatId: string, messages: string[]): Promise<void>;
  sendPhotos(chatId: string, photos: Photo[]): Promise<void>;
}

export type Photo = {
  url: string;
  caption?: string;
  replyMarkup?: ReplyMarkupItem[];
};

type ReplyMarkupItem = {
  text: string;
  url: string;
}[];
