import {
  Delete,
  Get,
  HttpCode,
  Injectable,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TeamPostingResponseDto } from './dto/posting-response.dto';
import { QueryParams } from 'src/common/query-params.interface';

@Injectable()
export class TeamPostingService {}
