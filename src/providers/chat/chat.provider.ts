export interface ChatProvider {
  sendMessages(chatId: string, messages: string[]): Promise<void>;
  sendPhotos(input: SendPhotosInput): Promise<void>;
}

export type SendPhotosInput = {
  chatId: string;
  photos: Photo[];
  replyMarkup?: ReplyMarkupItem[];
};

export type Photo = {
  url: string;
  caption?: string;
};

type ReplyMarkupItem = {
  text: string;
  url: string;
}[];
