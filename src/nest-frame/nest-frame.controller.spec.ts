import { Test, TestingModule } from '@nestjs/testing';
import { NestFrameController } from './nest-frame.controller';
import { NestFrameService } from './nest-frame.service';

describe('NestFrameController', () => {
  let controller: NestFrameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NestFrameController],
      providers: [NestFrameService],
    }).compile();

    controller = module.get<NestFrameController>(NestFrameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
