import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { basename, join } from "node:path";
import type { ProviderArtifact } from "@scroll3d/providers";
import {
  appendArtifact,
  appendCheckpoint,
  appendEvent,
  serializePipelineRun,
  type PipelineArtifact,
  type PipelineCheckpoint,
  type PipelineEvent,
  type PipelineRun,
  type PipelineRunStore
} from "./pipeline-state";

export interface FilePipelineRunStoreConfig {
  storageDir: string;
  extension?: ".json";
}

export class PipelineRunSerializer {
  serialize(run: PipelineRun): string {
    return `${safeJsonStringify(serializePipelineRun(run))}\n`;
  }
}

export class PipelineRunDeserializer {
  deserialize(raw: string, filePath = "pipeline-run.json"): PipelineRun {
    return safeJsonParse(raw, filePath) as PipelineRun;
  }
}

export class FilePipelineRunStore implements PipelineRunStore {
  private readonly storageDir: string;
  private readonly extension: ".json";
  private readonly serializer: PipelineRunSerializer;
  private readonly deserializer: PipelineRunDeserializer;

  constructor(
    config: FilePipelineRunStoreConfig,
    serializer = new PipelineRunSerializer(),
    deserializer = new PipelineRunDeserializer()
  ) {
    this.storageDir = config.storageDir;
    this.extension = config.extension ?? ".json";
    this.serializer = serializer;
    this.deserializer = deserializer;
    mkdirSync(this.storageDir, { recursive: true });
  }

  save(run: PipelineRun): void {
    const filePath = this.getRunPath(run.id);
    const tmpPath = `${filePath}.tmp`;

    writeFileSync(tmpPath, this.serializer.serialize(run), "utf8");
    renameSync(tmpPath, filePath);
  }

  get(runId: string): PipelineRun | undefined {
    const filePath = this.getRunPath(runId);

    if (!existsSync(filePath)) {
      return undefined;
    }

    return this.readRunFile(filePath);
  }

  list(): PipelineRun[] {
    return readdirSync(this.storageDir)
      .filter((fileName) => fileName.endsWith(this.extension))
      .sort()
      .map((fileName) => this.readRunFile(join(this.storageDir, fileName)));
  }

  delete(runId: string): boolean {
    const filePath = this.getRunPath(runId);

    if (!existsSync(filePath)) {
      return false;
    }

    unlinkSync(filePath);

    return true;
  }

  appendEvent(
    runId: string,
    event: Omit<PipelineEvent, "id" | "createdAt">
  ): PipelineEvent {
    const run = this.getRequiredRun(runId);
    const pipelineEvent = appendEvent(run, event);
    this.save(run);

    return pipelineEvent;
  }

  appendArtifact(
    runId: string,
    stepId: string,
    key: string,
    artifact: ProviderArtifact
  ): PipelineArtifact {
    const run = this.getRequiredRun(runId);
    const pipelineArtifact = appendArtifact(run, stepId, key, artifact);
    this.save(run);

    return pipelineArtifact;
  }

  appendCheckpoint(runId: string, stepId: string | null): PipelineCheckpoint {
    const run = this.getRequiredRun(runId);
    const checkpoint = appendCheckpoint(run, stepId);
    this.save(run);

    return checkpoint;
  }

  private readRunFile(filePath: string): PipelineRun {
    const raw = readFileSync(filePath, "utf8");

    return this.deserializer.deserialize(raw, filePath);
  }

  private getRequiredRun(runId: string): PipelineRun {
    const run = this.get(runId);

    if (!run) {
      throw new Error(`Pipeline run not found: ${runId}`);
    }

    return run;
  }

  private getRunPath(runId: string): string {
    return join(this.storageDir, `${toSafeRunFileName(runId)}${this.extension}`);
  }
}

export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function safeJsonParse(raw: string, filePath: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";

    throw new Error(
      `Failed to read pipeline run from ${basename(filePath)}: ${message}`
    );
  }
}

function toSafeRunFileName(runId: string): string {
  return runId.replace(/[^a-zA-Z0-9_.-]/g, "_");
}
