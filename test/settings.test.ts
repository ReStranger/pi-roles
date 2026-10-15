import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadSettings, userSettingsFile } from "../src/settings.ts";

describe("settings loader", () => {
  const tmpDirs: string[] = [];

  function makeTmp(): string {
    const dir = mkdtempSync(join(tmpdir(), "pi-roles-settings-test-"));
    tmpDirs.push(dir);
    return dir;
  }

  afterEach(() => {
    vi.unstubAllEnvs();
    tmpDirs.length = 0;
  });

  it("userSettingsFile points to PI_CODING_AGENT_DIR when set", () => {
    const fakeAgentDir = makeTmp();
    vi.stubEnv("PI_CODING_AGENT_DIR", fakeAgentDir);
    expect(userSettingsFile()).toBe(join(fakeAgentDir, "settings.json"));
  });

  it("loadSettings reads user settings from PI_CODING_AGENT_DIR", () => {
    const fakeAgentDir = makeTmp();
    vi.stubEnv("PI_CODING_AGENT_DIR", fakeAgentDir);
    writeFileSync(
      join(fakeAgentDir, "settings.json"),
      JSON.stringify({
        "pi-roles": {
          defaultRole: "custom-default",
          roleScope: "user",
          intercomMode: "send",
        },
      }),
    );

    const cwd = makeTmp();
    const settings = loadSettings(cwd);
    expect(settings.defaultRole).toBe("custom-default");
    expect(settings.roleScope).toBe("user");
    expect(settings.intercomMode).toBe("send");
  });

  it("project settings override user settings from PI_CODING_AGENT_DIR", () => {
    const fakeAgentDir = makeTmp();
    vi.stubEnv("PI_CODING_AGENT_DIR", fakeAgentDir);
    writeFileSync(
      join(fakeAgentDir, "settings.json"),
      JSON.stringify({
        "pi-roles": {
          defaultRole: "user-default",
          roleScope: "both",
          intercomMode: "off",
        },
      }),
    );

    const cwd = makeTmp();
    const projectPi = join(cwd, ".pi");
    mkdirSync(projectPi, { recursive: true });
    writeFileSync(
      join(projectPi, "settings.json"),
      JSON.stringify({
        "pi-roles": {
          defaultRole: "project-default",
        },
      }),
    );

    const settings = loadSettings(cwd);
    expect(settings.defaultRole).toBe("project-default");
    expect(settings.roleScope).toBe("both");
    expect(settings.intercomMode).toBe("off");
  });

  it("falls back to empty object on corrupt settings", () => {
    const fakeAgentDir = makeTmp();
    vi.stubEnv("PI_CODING_AGENT_DIR", fakeAgentDir);
    writeFileSync(join(fakeAgentDir, "settings.json"), "invalid json{{{");

    const cwd = makeTmp();
    const settings = loadSettings(cwd);
    expect(settings).toEqual({});
  });

  it("loadSettings accepts legacy titleModel in settings", () => {
    const fakeAgentDir = makeTmp();
    vi.stubEnv("PI_CODING_AGENT_DIR", fakeAgentDir);
    writeFileSync(
      join(fakeAgentDir, "settings.json"),
      JSON.stringify({
        "pi-roles": {
          defaultRole: "custom-default",
          titleModel: "anthropic/claude-3-5-haiku",
        },
      }),
    );

    const cwd = makeTmp();
    const settings = loadSettings(cwd);
    expect(settings.defaultRole).toBe("custom-default");
    expect(settings.titleModel).toBe("anthropic/claude-3-5-haiku");
  });
});
