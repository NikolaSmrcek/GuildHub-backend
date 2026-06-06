import { Injectable } from '@nestjs/common';
import { GuildHubLogger } from './shared/logger';

@Injectable()
export class AppService {
  private readonly logger = new GuildHubLogger(AppService.name);

  getStatus() {
    return { status: 'ok', ts: new Date().toISOString() };
  }
}
