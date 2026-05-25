import { describe, expect, it } from "vitest";
import { SequentialJobRunner } from "./index";
import type { RuntimeJob } from "./types";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("SequentialJobRunner", () => {
  it("runs jobs sequentially", async () => {
    const runner = new SequentialJobRunner();
    const order: string[] = [];

    runner.enqueue(
      createJob("job-1", async () => {
        order.push("job-1-start");
        await wait(5);
        order.push("job-1-end");
        return "one";
      })
    );
    runner.enqueue(
      createJob("job-2", async () => {
        order.push("job-2-start");
        await wait(5);
        order.push("job-2-end");
        return "two";
      })
    );

    const results = await runner.runAll();

    expect(results.map((job) => job.status)).toEqual(["completed", "completed"]);
    expect(order).toEqual(["job-1-start", "job-1-end", "job-2-start", "job-2-end"]);
  });

  it("marks failed jobs as failed", async () => {
    const runner = new SequentialJobRunner();
    runner.enqueue(
      createJob("job-fails", () => Promise.reject(new Error("model failed")))
    );

    const results = await runner.runAll();

    expect(results[0]?.status).toBe("failed");
    expect(runner.getJob("job-fails")?.error).toBe("model failed");
  });

  it("marks pending cancelled jobs as cancelled", () => {
    const runner = new SequentialJobRunner();
    runner.enqueue(createJob("job-cancelled", () => Promise.resolve("done")));

    expect(runner.cancel("job-cancelled")).toBe(true);
    expect(runner.getJob("job-cancelled")?.status).toBe("cancelled");
  });

  it("does not run two heavy jobs at the same time", async () => {
    const runner = new SequentialJobRunner();
    let active = 0;
    let maxActive = 0;

    const makeHeavyJob = (id: string): RuntimeJob =>
      createJob(id, async () => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        await wait(15);
        active -= 1;
        return id;
      });

    runner.enqueue(makeHeavyJob("heavy-1"));
    runner.enqueue(makeHeavyJob("heavy-2"));

    const firstRun = runner.runNext();
    await wait(1);
    const secondRun = await runner.runNext();
    const firstResult = await firstRun;
    const remainingResults = await runner.runAll();

    expect(secondRun).toBeUndefined();
    expect(firstResult?.status).toBe("completed");
    expect(remainingResults[0]?.status).toBe("completed");
    expect(maxActive).toBe(1);
  });

  it("marks running cancelled jobs as cancelled", async () => {
    const runner = new SequentialJobRunner();
    runner.enqueue(
      createJob("job-running-cancel", async ({ signal }) => {
        while (!signal.aborted) {
          await wait(1);
        }

        return "ignored";
      })
    );

    const run = runner.runNext();
    await wait(1);

    expect(runner.cancel("job-running-cancel")).toBe(true);

    const result = await run;

    expect(result?.status).toBe("cancelled");
  });
});

function createJob(id: string, run: RuntimeJob["run"]): RuntimeJob {
  return {
    id,
    name: id,
    heavy: true,
    run
  };
}
