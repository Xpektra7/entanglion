import { serve } from "bun";
import { readFile } from "node:fs/promises";

const html = await readFile(new URL("./index.html", import.meta.url), "utf8");
const css = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const script = await Bun.file(new URL("../../dist/web.js", import.meta.url)).text().catch(() => "");
const imageMimeTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};
const port = Number(process.env.PORT ?? 3000);

serve({
  port,
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/web.js") {
      return new Response(script || "console.error('Build web bundle first');", {
        headers: { "content-type": "application/javascript; charset=utf-8" },
      });
    }

    if (url.pathname === "/styles.css") {
      return new Response(css, {
        headers: { "content-type": "text/css; charset=utf-8" },
      });
    }

    if (url.pathname.startsWith("/images/")) {
      const filename = url.pathname.slice("/images/".length);
      const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();
      const mimeType = imageMimeTypes[extension] ?? "application/octet-stream";
      const image = Bun.file(new URL(`../../images/${filename}`, import.meta.url));
      return new Response(image, {
        headers: { "content-type": mimeType },
      });
    }

    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  },
});

console.log(`Web app running on http://localhost:${port}`);
