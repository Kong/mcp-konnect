const DEFAULT_MAX_LENGTH = 256;
const UNSAFE_RENDER_CHARACTERS = /[!<>\[\]\(\)`]/g;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]+/g;
const WHITESPACE = /\s+/g;
/**
 * Normalizes request-derived text so it stays readable without preserving raw render-trigger syntax.
 */
export function normalizeUntrustedText(value, maxLength = DEFAULT_MAX_LENGTH) {
    if (value === undefined || value === null) {
        return undefined;
    }
    const flattened = value
        .replace(CONTROL_CHARACTERS, " ")
        .replace(WHITESPACE, " ")
        .trim();
    const neutralized = flattened.replace(UNSAFE_RENDER_CHARACTERS, "\\$&");
    if (neutralized.length <= maxLength) {
        return neutralized;
    }
    return `${neutralized.slice(0, Math.max(0, maxLength - 3))}...`;
}
