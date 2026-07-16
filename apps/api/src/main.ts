import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import express from "express";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false, cors: true });

  app.use(express.json({
    limit: process.env.API_JSON_BODY_LIMIT ?? "40mb",
    verify: (req: express.Request, _res: express.Response, buf: Buffer) => {
      (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buf);
    }
  }));

  app.enableCors({
    origin: process.env.APP_URL ?? "http://localhost:3000",
    credentials: true
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
