import { Test, TestingModule } from '@nestjs/testing';
import { PostingController } from './posting.controller';
import { PostingModule } from './posting.module';

describe.skip('PostingController', () => {
  let controller: PostingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PostingModule],
    }).compile();

    controller = module.get<PostingController>(PostingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
