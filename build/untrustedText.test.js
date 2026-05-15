import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUntrustedText } from "./untrustedText.js";
test("normalizeUntrustedText neutralizes markdown image-like syntax", () => {
    const value = "redis_password: ![secret](https://attacker.test/a.gif)";
    assert.equal(normalizeUntrustedText(value), "redis_password: \\!\\[secret\\]\\(https://attacker.test/a.gif\\)");
});
test("normalizeUntrustedText neutralizes html-like tags", () => {
    assert.equal(normalizeUntrustedText("<script>alert(1)</script>"), "\\<script\\>alert\\(1\\)\\</script\\>");
});
test("normalizeUntrustedText flattens multiline input", () => {
    assert.equal(normalizeUntrustedText("line one\nline\t two\r\nline three"), "line one line two line three");
});
test("normalizeUntrustedText truncates overlong input consistently", () => {
    const result = normalizeUntrustedText("a".repeat(30), 12);
    assert.equal(result, "aaaaaaaaa...");
});
