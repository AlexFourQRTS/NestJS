import { Test, TestingModule } from '@nestjs/testing';
import { ThinkService } from './think.service';

describe('ThinkService', () => {
  let service: ThinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThinkService],
    }).compile();

    service = module.get<ThinkService>(ThinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
