"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const not_found_filter_1 = require("./filters/not-found.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'storage'), {
        prefix: '/files/',
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });
    app.setGlobalPrefix('api', {
        exclude: ['/'],
    });
    app.useGlobalFilters(new not_found_filter_1.NotFoundFilter());
    await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
//# sourceMappingURL=main.js.map