import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { AppService } from './app.service';

class HealthResponse {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2026-06-10T14:30:00.000Z' })
  ts!: string;
}

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns server status and current timestamp.',
  })
  @ApiOkResponse({ type: HealthResponse, description: 'Server is running' })
  health(): HealthResponse {
    return this.appService.getStatus();
  }
}
