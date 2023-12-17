import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
  const globalPrefix = "follower-api";

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  setUpSwagger(`${globalPrefix}/api`, app);
  const configService: ConfigService = app.get(ConfigService);

  await app.listen(configService.get("PORT"));
  console.log("app running on port", configService.get("PORT"));
}
bootstrap();

function setUpSwagger(docPrefix: string, app: any) {
  const options = new DocumentBuilder()
    .setTitle("Follower Apis")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup(docPrefix, app, document);
}
