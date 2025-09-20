import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

const scalarCustomCss = `
  body { font-family: sans-serif; margin: 0; padding: 0; }
`;

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('docs')
  scalar(
    @Query('url') url: string,
    @Query('proxyUrl') proxyUrl: string = 'https://proxy.scalar.com',
    @Res() res: Response,
  ) {
    const apiJsonUrl =
      url ||
      this.configService.get<string>(
        'API_JSON_URL',
        'http://localhost:3001/api-json',
      );
    const html = `
      <!doctype html>
      <html>
        <head>
          <title>API Reference</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${scalarCustomCss}</style>
        </head>
        <body>
          <script
            id="api-reference"
            data-url="${apiJsonUrl}"
            data-proxy-url="${proxyUrl}">
          </script>
          <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
      </html>
    `;
    res.contentType('text/html');
    res.send(html);
  }
}
