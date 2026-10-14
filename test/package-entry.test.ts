import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("package entrypoints", () => {
  it("package.json declares extension entrypoint ./src/index.ts", () => {
    const raw = readFileSync(resolve(__dirname, "../package.json"), "utf8");
    const pkg = JSON.parse(raw);

    // Single source entrypoint directly in src/
    expect(pkg.pi?.extensions).toEqual(["./src/index.ts"]);
    expect(existsSync(resolve(__dirname, "../src/index.ts"))).toBe(true);

    // Package files include src/ for the extension entrypoint and dist/ for exports
    expect(pkg.files).toContain("src/");
    expect(pkg.files).toContain("dist/");
    expect(pkg.files).not.toContain("index.ts");
    expect(pkg.files).not.toContain("./index.ts");

    // Standard npm exports remain on compiled dist
    expect(pkg.main).toBe("./dist/index.js");
    expect(pkg.exports?.["."]).toBe("./dist/index.js");
    expect(pkg.types).toBe("./dist/index.d.ts");
  });
});
