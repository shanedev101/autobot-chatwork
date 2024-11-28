import { HttpService } from '@nestjs/axios';
import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Res,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async chat(@Body() body: any, @Res() res: any) {
    try {
      const accessToken = process.env.CHATWORK_ACCESS_TOKEN;
      if (!accessToken) {
        throw new HttpException(
          'Missing chatwork token',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log(body);

      const webhookEvent = body?.webhook_event;
      if (!webhookEvent) {
        return res
          .status(400)
          .json({ msg: 'Missing webhook_event. Skip send.' });
      }

      const {
        room_id: roomId,
        body: message,
        from_account_id: fromAccountId,
      } = webhookEvent;

      if (roomId && message && fromAccountId) {
        if (message.indexOf('[toall]') === -1) {
          const splitMsg = message.split('\n');
          const question =
            splitMsg.length > 1 ? splitMsg.slice(1).join('\n') : splitMsg[0];
          console.log('Question:', question);

          // Gửi câu hỏi tới ChatGPT
          const answer = await this.sendToChatGPT(question);

          // Gửi trả lời tới Chatwork
          const chatworkResponse = await this.sendToChatwork(
            roomId,
            fromAccountId,
            answer,
          );

          return res.status(200).json({ msg: 'OK', data: chatworkResponse });
        }
      } else {
        return res.status(400).json({
          msg: 'Missing roomId, message, or fromAccountId. Skip send.',
        });
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Something went wrong: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendToChatGPT(question: string): Promise<string> {
    const data = {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.openai.com/v1/chat/completions',
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.GPT_API_KEY || ''}`,
            },
          },
        ),
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`Error GPT: ${error.message}`);
    }
  }

  async sendToChatwork(
    roomId: string,
    fromAccountId: string,
    answer: string,
  ): Promise<any> {
    const baseUrl = 'https://api.chatwork.com/v2';
    const accessToken = process.env.CHATWORK_ACCESS_TOKEN || '';

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}/rooms/${roomId}/messages`,
          { body: `[To:${fromAccountId}]${answer}` },
          {
            headers: {
              'X-ChatWorkToken': accessToken,
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'ChatWork-Webhook/1.0.0',
              'x-chatworkwebhooksignature': process.env.SIGNATURE,
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw new Error(`Error Chatwork: ${error.message}`);
    }
  }
}
