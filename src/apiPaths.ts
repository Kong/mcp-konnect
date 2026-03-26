export function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function encodeQueryValue(value: string): string {
  return encodeURIComponent(value);
}

export function buildControlPlanePath(controlPlaneId: string): string {
  return `/control-planes/${encodePathSegment(controlPlaneId)}`;
}

export function buildControlPlaneEndpoint(controlPlaneId: string): string {
  return buildControlPlanePath(controlPlaneId);
}

export function buildControlPlaneGroupMembershipsEndpoint(groupId: string, pageSize = 10, pageAfter?: string): string {
  let endpoint = `${buildControlPlanePath(groupId)}/group-memberships?page[size]=${pageSize}`;

  if (pageAfter) {
    endpoint += `&page[after]=${encodeQueryValue(pageAfter)}`;
  }

  return endpoint;
}

export function buildControlPlaneGroupMemberStatusEndpoint(controlPlaneId: string): string {
  return `${buildControlPlanePath(controlPlaneId)}/group-member-status`;
}

export function buildControlPlaneCoreEntitiesEndpoint(
  controlPlaneId: string,
  entity: "services" | "routes" | "consumers" | "plugins"
): string {
  return `${buildControlPlanePath(controlPlaneId)}/core-entities/${entity}`;
}

export function buildControlPlaneCoreEntitiesListEndpoint(
  controlPlaneId: string,
  entity: "services" | "routes" | "consumers" | "plugins",
  size: number,
  offset?: string
): string {
  let endpoint = `${buildControlPlaneCoreEntitiesEndpoint(controlPlaneId, entity)}?size=${size}`;

  if (offset) {
    endpoint += `&offset=${encodeQueryValue(offset)}`;
  }

  return endpoint;
}
