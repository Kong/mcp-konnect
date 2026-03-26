export function encodePathSegment(value: string): string {
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
    endpoint += `&page[after]=${pageAfter}`;
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
