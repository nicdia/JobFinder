import { readFileSync } from "fs";
import path from "path";
import { PipelineConfig } from "../types/pipelineTypes";

export function loadPipelineConfig(): PipelineConfig {
  const configPath = path.resolve("src/config", "pipeline.config.json");
  const raw = readFileSync(configPath, "utf-8");
  return JSON.parse(raw) as PipelineConfig;
}
