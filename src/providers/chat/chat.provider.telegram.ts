import axios, { AxiosInstance } from 'axios';
import random from 'lodash/random';
import { ChatProvider, Photo } from './chat.provider';
import { handleAxiosError } from '../../utils/axios';

type ConstructorInput = {
  botToken: string;
};

class ChatProviderTelegram implements ChatProvider {
  private readonly client: AxiosInstance;

  private readonly baseUrl: string;

  private readonly botToken: string;

  constructor({ botToken }: ConstructorInput) {
    const baseURL = 'https://api.telegram.org';

    this.baseUrl = baseURL;

    this.botToken = botToken;

    this.client = axios.create({
      baseURL,
    });
  }

  async sendMessages(chatId: string, messages: string[]) {
    const iter = async (messagesList: string[]): Promise<void> => {
      if (messagesList.length === 0) {
        return;
      }

      const message = messagesList[0];

      if (!message) {
        return iter(messagesList.slice(1));
      }

      await this.sendMessage(chatId, message);

      await this.sleep(random(1000, 3000));

      return iter(messagesList.slice(1));
    };

    await iter(messages);
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    const url = `/bot${this.botToken}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=html&disable_web_page_preview=true`;

    try {
      await this.client.get(url);
    } catch (error) {
      return handleAxiosError(error, `${this.baseUrl}${url}`);
    }
  }

  async sendPhotos(chatId: string, photos: Photo[]): Promise<void> {
    const iter = async (photosList: Photo[]): Promise<void> => {
      if (photosList.length === 0) {
        return;
      }

      const photo = photosList[0];

      if (!photo.url) {
        return iter(photosList.slice(1));
      }

      await this.sendPhotoByUrl(chatId, photo);

      await this.sleep(random(1000, 3000));

      return iter(photosList.slice(1));
    };

    await iter(photos);
  }

  async sendPhotoByUrl(chatId: string, photo: Photo): Promise<void> {
    const url = `/bot${this.botToken}/sendPhoto`;

    try {
      const replyMarkup = photo.replyMarkup ?? [];

      const reply_markup = replyMarkup.length > 0 ? { inline_keyboard: replyMarkup } : undefined;

      await this.client.post(url, {
        chat_id: chatId,
        photo: photo.url,
        caption: photo.caption,
        reply_markup,
      });
    } catch (error) {
      return handleAxiosError(error, `${this.baseUrl}${url}`);
    }
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default ChatProviderTelegram;
