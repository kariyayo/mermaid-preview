import { join } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "public");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

export function startServer(port: number, initialContent: string) {
  return Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      const pathname = url.pathname;

      // API endpoint: return initial content
      if (pathname === "/api/content") {
        return Response.json({ content: initialContent });
      }

      // Static file serving
      let filePath: string;
      if (pathname === "/") {
        filePath = join(PUBLIC_DIR, "index.html");
      } else {
        // Sanitize path to prevent directory traversal
        const safePath = pathname.replace(/\.\./g, "");
        filePath = join(PUBLIC_DIR, safePath);
      }

      const ext = filePath.substring(filePath.lastIndexOf("."));
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      const file = Bun.file(filePath);
      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    },

    error() {
      return new Response("Not Found", { status: 404 });
    },
  });
}
