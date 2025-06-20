import { Test, TestingModule } from '@nestjs/testing';
import { ThinkController } from './think.controller';
import { ThinkService } from './think.service';

describe('ThinkController', () => {
  let controller: ThinkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThinkController],
      providers: [ThinkService],
    }).compile();

    controller = module.get<ThinkController>(ThinkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
