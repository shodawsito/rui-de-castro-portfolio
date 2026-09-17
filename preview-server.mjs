import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png" };

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  let target = normalize(join(root, pathname));
  if (!target.startsWith(root)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  try {
    if (statSync(target).isDirectory()) target = join(target, "index.html");
    response.writeHead(200, { "Content-Type": types[extname(target)] ?? "application/octet-stream" });
    createReadStream(target).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
