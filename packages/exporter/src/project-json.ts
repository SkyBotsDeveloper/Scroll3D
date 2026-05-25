import type { Scroll3DProject } from "@scroll3d/core";
import { safeJsonStringify } from "./sanitize";

export function generateProjectJson(project: Scroll3DProject): string {
  return safeJsonStringify({
    ...project,
    providers: [],
    agents: project.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      description: agent.description
    }))
  });
}
