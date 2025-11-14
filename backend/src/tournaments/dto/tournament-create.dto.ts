import {
  IsDate,
  IsInt,
  Min,
  MinDate,
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoundDto {
  @IsInt()
  @Min(1)
  round: number;

  @Type(() => Date)
  @IsDate()
  @MinDate(new Date(), {
    message: 'Match date must be in the future',
  })
  date: Date;
}

export class TournamentCreateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Date)
  @IsDate()
  startsAt: Date;

  @ValidateNested({ each: true })
  @Type(() => RoundDto)
  @ArrayMinSize(1)
  rounds: RoundDto[];
}
