import test from "node:test";
import assert from "node:assert/strict";
import { listPluginsPrompt } from "./prompts.js";
test("listPluginsPrompt documents explicit raw config opt-in and sensitivity", () => {
    const prompt = listPluginsPrompt();
    assert.match(prompt, /includeRawConfig/i);
    assert.match(prompt, /defaults to false/i);
    assert.match(prompt, /sensitive values/i);
    assert.match(prompt, /excluded by default/i);
    assert.match(prompt, /KONNECT_ALLOW_RAW_PLUGIN_CONFIG/i);
    assert.match(prompt, /server policy/i);
});
