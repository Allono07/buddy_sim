import { readFile, mkdir, writeFile } from "node:fs/promises";
import { metadata } from "../src/metadata.js";
const html = await readFile("dist/index.html", "utf8");
for (const [path, [title, description]] of Object.entries(metadata)) {
  if (path === "/") continue;
  await mkdir(`dist${path}`, { recursive: true });
  await writeFile(
    `dist${path}/index.html`,
    html
      .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`),
  );
}
await mkdir("dist/simulation", { recursive: true });
await writeFile("dist/simulation/index.html", html);
await writeFile("dist/_redirects", "/* /index.html 200\n");
