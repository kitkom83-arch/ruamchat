import { Controller, Get } from "@nestjs/common";
import { buildReadinessSnapshot } from "../readiness.js";

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

  @Get("readiness")
  readiness() {
    return buildReadinessSnapshot();
  }
}
