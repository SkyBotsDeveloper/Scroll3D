import { sampleProject } from "@scroll3d/core";

export { sampleProject };

export const sampleProjectJson = formatProjectJson(sampleProject);

export function formatProjectJson(project: unknown): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}
