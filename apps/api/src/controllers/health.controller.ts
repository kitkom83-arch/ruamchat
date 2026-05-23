import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "ok",
      service: "api",
      time: new Date().toISOString(),
      mode: process.env.API_MODE ?? "local"
    };
  }
}
