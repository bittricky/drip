#!/usr/bin/env node
import { Liquid } from "liquidjs";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

const rootDir = path.resolve(process.cwd());
const templatesDir = path.join(rootDir, "templates");
const sectionsDir = path.join(rootDir, "sections");
const assets = [path.join(rootDir, "style.css")];
const distDir = path.join(rootDir, "dist");

// Ensure dist directory exists
await fsp.mkdir(distDir, { recursive: true });

// Load section settings (local defaults)
const sectionDataPath = path.join(
  rootDir,
  "scripts",
  "data",
  "sections",
  "drip.json"
);
let sectionSettings = {};
try {
  const raw = await fsp.readFile(sectionDataPath, "utf8");
  sectionSettings = JSON.parse(raw);
} catch (e) {
  // Fallback defaults if data file not found
  sectionSettings = {
    bg_color: "#ffffff",
    droplet_light: "#ffffff",
    droplet_mid: "#6b6b6b",
    droplet_dark: "#2c2c2c",
    ocean_color: "#2c2c2c",
    anim_duration: 2,
    show_droplet: true,
    show_ripple: true,
  };
}

// Initialize Liquid engine
const engine = new Liquid({
  root: [templatesDir, sectionsDir, rootDir],
  extname: ".liquid",
  cache: false,
});

// Emulate Shopify-like filters
engine.registerFilter("asset_url", (input) => {
  // In dist, assets are copied at the root.
  return input;
});

engine.registerFilter("stylesheet_tag", (href) => {
  return `<link rel="stylesheet" href="${href}">`;
});

// Ignore Shopify-only schema blocks: {% schema %} ... {% endschema %}
engine.registerTag("schema", {
  parse: function (token, remainTokens) {
    const stream = this.liquid.parser.parseStream(remainTokens)
      .on("tag:endschema", () => stream.stop())
      .on("text", () => {})
      .on("tag", () => {})
      .on("end", () => {});
    stream.start();
  },
  render: async function () { return ""; }
});
engine.registerTag("endschema", {
  render: async function () { return ""; }
});

// Custom 'section' tag to include and render a section file
engine.registerTag("section", {
  parse: function (token) {
    // token.args contains the string after the tag name
    this.sectionName = token.args
      .replace(/^\s*'|"|\s*$/g, "")
      .replace(/['"]/g, "");
  },
  render: async function (scope, emitter) {
    const name = this.sectionName;
    const sectionFile = path.join(sectionsDir, `${name}.liquid`);
    const exists = fs.existsSync(sectionFile);
    if (!exists) {
      return `<!-- section '${name}' not found -->`;
    }

    // Build a section object
    const sectionObj = {
      id: name,
      type: name,
      settings: sectionSettings,
    };

    // Render the section template with the current scope + section
    const html = await engine.renderFile(`${name}.liquid`, {
      section: sectionObj,
    });
    return html;
  },
});

// Copy assets to dist
await Promise.all(
  assets.map(async (src) => {
    const dest = path.join(distDir, path.basename(src));
    await fsp.copyFile(src, dest);
  })
);

// Render the main page template to dist/index.html
const outFile = path.join(distDir, "index.html");
const html = await engine.renderFile("page.drip.liquid");
await fsp.writeFile(outFile, html, "utf8");

console.log(`Built ${path.relative(rootDir, outFile)}`);
