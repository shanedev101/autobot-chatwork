import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/chatwork')
  async chat(@Body() body: any, @Res() res: any) {
    return this.appService.chat(body, res);
  }
}
