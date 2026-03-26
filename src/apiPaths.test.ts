import test from "node:test";
import assert from "node:assert/strict";
import {
  buildControlPlaneCoreEntitiesEndpoint,
  buildControlPlaneEndpoint,
  buildControlPlaneGroupMemberStatusEndpoint,
  buildControlPlaneGroupMembershipsEndpoint,
  encodePathSegment
} from "./apiPaths.js";

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

test("encodePathSegment percent-encodes traversal content", () => {
  assert.equal(encodePathSegment("../api-products"), "..%2Fapi-products");
});

test("buildControlPlaneEndpoint preserves valid ids in the expected path", () => {
  assert.equal(
    buildControlPlaneEndpoint(VALID_ID),
    `/control-planes/${VALID_ID}`
  );
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
