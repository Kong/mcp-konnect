import test from "node:test";
import assert from "node:assert/strict";
import {
  checkControlPlaneGroupMembershipParameters,
  getControlPlaneParameters,
  listConsumersParameters,
  listControlPlaneGroupMembershipsParameters,
  listPluginsParameters,
  listRoutesParameters,
  listServicesParameters
} from "./parameters.js";

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";

test("validated control plane schema accepts a UUID-shaped id for all relevant tools", () => {
  assert.equal(listServicesParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId, VALID_ID);
  assert.equal(listRoutesParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId, VALID_ID);
  assert.equal(listConsumersParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId, VALID_ID);
  assert.equal(listPluginsParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId, VALID_ID);
  assert.equal(getControlPlaneParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId, VALID_ID);
  assert.equal(
    listControlPlaneGroupMembershipsParameters().parse({ groupId: VALID_ID }).groupId,
    VALID_ID
  );
  assert.equal(
    checkControlPlaneGroupMembershipParameters().parse({ controlPlaneId: VALID_ID }).controlPlaneId,
    VALID_ID
  );
});

test("validated control plane schema rejects traversal input", () => {
  assert.equal(listServicesParameters().safeParse({ controlPlaneId: "../api-products" }).success, false);
  assert.equal(
    listControlPlaneGroupMembershipsParameters().safeParse({ groupId: "../api-products" }).success,
    false
  );
});

test("validated control plane schema rejects values containing slash, question mark, or hash", () => {
  assert.equal(listRoutesParameters().safeParse({ controlPlaneId: "abc/def" }).success, false);
  assert.equal(listConsumersParameters().safeParse({ controlPlaneId: "abc?def" }).success, false);
  assert.equal(listPluginsParameters().safeParse({ controlPlaneId: "abc#def" }).success, false);
});

test("validated control plane schema returns a clear UUID validation error", () => {
  const result = getControlPlaneParameters().safeParse({ controlPlaneId: "not-a-uuid" });

  assert.equal(result.success, false);
  assert.match(result.error.issues[0]?.message ?? "", /valid UUIDs/i);
});
