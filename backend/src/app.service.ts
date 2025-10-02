import { Injectable } from '@nestjs/common';

/**
 * Service providing application-level utilities.
 */
@Injectable()
export class AppService {
  /**
   * Returns a hello world string.
   * @returns {string} Hello World!
   */
  getHello(): string {
    return 'Hello World!';
  }
}
