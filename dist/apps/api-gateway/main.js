import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3001); // Different port from auth-service
}
bootstrap();
//# sourceMappingURL=main.js.map