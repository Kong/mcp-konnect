import test from "node:test";
import assert from "node:assert/strict";
import { listPlugins } from "./configuration.js";
const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const RAW_PLUGIN_CONFIG_ENV = "KONNECT_ALLOW_RAW_PLUGIN_CONFIG";
function createPluginApi() {
    return {
        async listPlugins() {
            return {
                offset: "next-cursor",
                total: 1,
                data: [
                    {
                        id: "plugin-1",
                        name: "rate-limiting",
                        enabled: true,
                        config: {
                            policy: "redis",
                            redis_host: "redis.internal",
                            redis_password: "top-secret"
                        },
                        protocols: ["http", "https"],
                        tags: ["prod"],
                        service: { id: "svc-1" },
                        created_at: "2026-03-26T00:00:00Z",
                        updated_at: "2026-03-26T00:00:00Z"
                    }
                ]
            };
        }
    };
}
function withRawPluginConfigPolicy(value, fn) {
    const previousValue = process.env[RAW_PLUGIN_CONFIG_ENV];
    if (value === undefined) {
        delete process.env[RAW_PLUGIN_CONFIG_ENV];
    }
    else {
        process.env[RAW_PLUGIN_CONFIG_ENV] = value;
    }
    return fn().finally(() => {
        if (previousValue === undefined) {
            delete process.env[RAW_PLUGIN_CONFIG_ENV];
        }
        else {
            process.env[RAW_PLUGIN_CONFIG_ENV] = previousValue;
        }
    });
}
test("listPlugins excludes raw config by default and returns summary information", async () => {
    await withRawPluginConfigPolicy(undefined, async () => {
        const result = await listPlugins(createPluginApi(), VALID_ID);
        const plugin = result.plugins[0];
        assert.equal(result.metadata.includeRawConfigRequested, false);
        assert.equal(result.metadata.rawConfigAllowedByServerPolicy, false);
        assert.equal(result.metadata.includeRawConfig, false);
        assert.deepEqual(result.metadata.warnings, []);
        assert.equal(plugin.configIncluded, false);
        assert.deepEqual(plugin.configKeys, ["policy", "redis_host", "redis_password"]);
        assert.equal(plugin.configEntryCount, 3);
        assert.equal("config" in plugin, false);
    });
});
test("listPlugins does not return raw config when the request opts in but server policy disables it", async () => {
    await withRawPluginConfigPolicy("false", async () => {
        const result = await listPlugins(createPluginApi(), VALID_ID, 100, undefined, true);
        const plugin = result.plugins[0];
        assert.equal(result.metadata.includeRawConfigRequested, true);
        assert.equal(result.metadata.rawConfigAllowedByServerPolicy, false);
        assert.equal(result.metadata.includeRawConfig, false);
        assert.match(result.metadata.warnings[0] ?? "", /disabled by server policy/i);
        assert.equal(plugin.configIncluded, false);
        assert.deepEqual(plugin.configKeys, ["policy", "redis_host", "redis_password"]);
        assert.equal("config" in plugin, false);
    });
});
test("listPlugins returns raw config only when includeRawConfig is explicitly enabled and server policy allows it", async () => {
    await withRawPluginConfigPolicy("true", async () => {
        const result = await listPlugins(createPluginApi(), VALID_ID, 100, undefined, true);
        const plugin = result.plugins[0];
        assert.equal(result.metadata.includeRawConfigRequested, true);
        assert.equal(result.metadata.rawConfigAllowedByServerPolicy, true);
        assert.equal(result.metadata.includeRawConfig, true);
        assert.match(result.metadata.warnings[0] ?? "", /server policy allows it/i);
        assert.equal(plugin.configIncluded, true);
        assert.deepEqual(plugin.config, {
            policy: "redis",
            redis_host: "redis.internal",
            redis_password: "top-secret"
        });
        assert.equal("configKeys" in plugin, false);
        assert.equal("configEntryCount" in plugin, false);
    });
});
