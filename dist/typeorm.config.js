"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const config_1 = require("@nestjs/config");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
(0, dotenv_1.config)();
const configService = new config_1.ConfigService();
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: [(0, path_1.join)(__dirname, 'src', '**', '*.entity{.ts,.js}')],
    migrations: [(0, path_1.join)(__dirname, 'src', 'migrations', '**', '*.{.ts,.js}')],
    migrationsTableName: 'migrations',
    logging: true,
});
//# sourceMappingURL=typeorm.config.js.map