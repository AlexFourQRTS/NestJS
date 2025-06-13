import { ExceptionFilter, NotFoundException, ArgumentsHost } from '@nestjs/common';
export declare class NotFoundFilter implements ExceptionFilter {
    catch(exception: NotFoundException, host: ArgumentsHost): void;
}
