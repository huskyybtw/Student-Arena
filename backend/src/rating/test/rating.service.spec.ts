import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from '../rating.service';
import { RatingModule } from '../rating.module';

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RatingModule],
    }).compile();

    service = module.get<RatingService>(RatingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
