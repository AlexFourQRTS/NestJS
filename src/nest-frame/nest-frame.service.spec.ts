import { Test, TestingModule } from '@nestjs/testing';
import { NestFrameService } from './nest-frame.service';

describe('NestFrameService', () => {
  let service: NestFrameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NestFrameService],
    }).compile();

    service = module.get<NestFrameService>(NestFrameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
