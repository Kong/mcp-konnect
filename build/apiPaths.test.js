import test from "node:test";
import assert from "node:assert/strict";
import { buildControlPlaneCoreEntitiesEndpoint, buildControlPlaneCoreEntitiesListEndpoint, buildControlPlaneEndpoint, buildControlPlaneGroupMemberStatusEndpoint, buildControlPlaneGroupMembershipsEndpoint, encodeQueryValue, encodePathSegment } from "./apiPaths.js";
const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
test("encodePathSegment percent-encodes traversal content", () => {
    assert.equal(encodePathSegment("../api-products"), "..%2Fapi-products");
});
test("encodeQueryValue percent-encodes query control characters", () => {
    assert.equal(encodeQueryValue("cursor one=two&size=1000"), "cursor%20one%3Dtwo%26size%3D1000");
});
test("buildControlPlaneEndpoint preserves valid ids in the expected path", () => {
    assert.equal(buildControlPlaneEndpoint(VALID_ID), `/control-planes/${VALID_ID}`);
});
test("buildControlPlaneEndpoint does not allow raw traversal segments in the path", () => {
    const endpoint = buildControlPlaneEndpoint("../api-products");
    assert.equal(endpoint, "/control-planes/..%2Fapi-products");
    assert.doesNotMatch(endpoint, /\/control-planes\/\.\.\//);
});
test("buildControlPlaneGroupMembershipsEndpoint keeps the group id as a single encoded path segment", () => {
    const endpoint = buildControlPlaneGroupMembershipsEndpoint("../api-products", 25);
    assert.equal(endpoint, "/control-planes/..%2Fapi-products/group-memberships?page[size]=25");
    assert.doesNotMatch(endpoint, /\/control-planes\/\.\.\//);
});
test("buildControlPlaneGroupMemberStatusEndpoint keeps the control plane id encoded", () => {
    const endpoint = buildControlPlaneGroupMemberStatusEndpoint("../api-products");
    assert.equal(endpoint, "/control-planes/..%2Fapi-products/group-member-status");
    assert.doesNotMatch(endpoint, /\/control-planes\/\.\.\//);
});
test("buildControlPlaneCoreEntitiesEndpoint keeps entity routes under the encoded control plane path", () => {
    const endpoint = buildControlPlaneCoreEntitiesEndpoint("../api-products", "plugins");
    assert.equal(endpoint, "/control-planes/..%2Fapi-products/core-entities/plugins");
    assert.doesNotMatch(endpoint, /\/control-planes\/\.\.\//);
});
test("buildControlPlaneGroupMembershipsEndpoint keeps a normal pageAfter value as one query parameter", () => {
    const endpoint = buildControlPlaneGroupMembershipsEndpoint(VALID_ID, 25, "cursor-123");
    assert.equal(endpoint, `/control-planes/${VALID_ID}/group-memberships?page[size]=25&page[after]=cursor-123`);
});
test("buildControlPlaneGroupMembershipsEndpoint encodes a fragment-like pageAfter value", () => {
    const endpoint = buildControlPlaneGroupMembershipsEndpoint(VALID_ID, 25, "cursor#fragment");
    assert.equal(endpoint, `/control-planes/${VALID_ID}/group-memberships?page[size]=25&page[after]=cursor%23fragment`);
});
test("buildControlPlaneCoreEntitiesListEndpoint keeps a normal offset as one query parameter", () => {
    const endpoint = buildControlPlaneCoreEntitiesListEndpoint(VALID_ID, "services", 50, "cursor-123");
    assert.equal(endpoint, `/control-planes/${VALID_ID}/core-entities/services?size=50&offset=cursor-123`);
});
test("buildControlPlaneCoreEntitiesListEndpoint encodes an offset containing ampersands", () => {
    const endpoint = buildControlPlaneCoreEntitiesListEndpoint(VALID_ID, "routes", 50, "foo&size=1000");
    assert.equal(endpoint, `/control-planes/${VALID_ID}/core-entities/routes?size=50&offset=foo%26size%3D1000`);
    assert.doesNotMatch(endpoint, /&size=1000$/);
});
test("buildControlPlaneCoreEntitiesListEndpoint encodes spaces and equals in offset values", () => {
    const endpoint = buildControlPlaneCoreEntitiesListEndpoint(VALID_ID, "plugins", 10, "cursor one=two");
    assert.equal(endpoint, `/control-planes/${VALID_ID}/core-entities/plugins?size=10&offset=cursor%20one%3Dtwo`);
});
