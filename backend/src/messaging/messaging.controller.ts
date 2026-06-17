import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import type { Request } from 'express';
import { SkipAuth } from '../common/decorators/skip-auth.decorator';
import { validateTwilioSignature } from './adapters/twilio-whatsapp.adapter';

@Controller('webhooks/twilio')
export class MessagingController {
  constructor(
    private readonly config: ConfigService,
    @InjectQueue('message.status') private readonly statusQueue: Queue,
  ) {}

  @SkipAuth()
  @Post('status')
  @HttpCode(204)
  async receiveStatus(
    @Req() req: Request,
    @Body() body: Record<string, string>,
  ): Promise<void> {
    const authToken =
      this.config.get<string>('whatsapp.twilio.authToken') ?? '';
    const signature = req.headers['x-twilio-signature'] as string;
    const url = `${this.config.get<string>('app.baseUrl')}/webhooks/twilio/status`;

    if (!validateTwilioSignature(authToken, signature, url, body)) {
      throw new UnauthorizedException('Invalid Twilio signature');
    }

    await this.statusQueue.add('status-update', {
      providerMessageId: body['MessageSid'],
      status: body['MessageStatus'],
    });
  }
}
