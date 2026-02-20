#!/usr/bin/env bun

import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { startServer } from "./server";

async function readStdin(): Promise<string | null> {
  // Check if stdin is a TTY (interactive terminal) — if so, no piped input
  if (process.stdin.isTTY) return null;

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function readFile(filePath: string): string {
  const resolved = resolve(filePath);
  try {
    statSync(resolved);
  } catch {
    console.error(`Error: File not found: ${resolved}`);
    process.exit(1);
  }
  return readFileSync(resolved, "utf-8");
}

async function findAvailablePort(startPort: number): Promise<number> {
  for (let port = startPort; port < startPort + 100; port++) {
    try {
      const server = Bun.serve({
        port,
        fetch() {
          return new Response();
        },
      });
      server.stop(true);
      return port;
    } catch {
      // Port in use, try next
    }
  }
  throw new Error("No available port found");
}

async function openBrowser(url: string) {
  const proc = Bun.spawn(["open", url], {
    stdout: "ignore",
    stderr: "ignore",
  });
  await proc.exited;
}

async function main() {
  let content = "";

  const args = process.argv.slice(2);
  const once = args.includes("--once");
  const fileArg = args.find((a) => !a.startsWith("-"));

  if (fileArg) {
    content = readFile(fileArg);
  } else {
    const stdinContent = await readStdin();
    if (stdinContent) {
      content = stdinContent;
    }
  }

  const port = await findAvailablePort(3000);
  const server = startServer({
    port,
    initialContent: content,
    onContentServed: once
      ? () => {
          setTimeout(() => {
            server.stop(true);
            process.exit(0);
          }, 1000);
        }
      : undefined,
  });

  const url = `http://localhost:${port}`;
  console.log(`Mermaid Preview running at ${url}`);
  if (once) {
    console.log("(--once: will exit after browser loads)");
  }

  await openBrowser(url);

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.stop(true);
    process.exit(0);
  });
}

main();
