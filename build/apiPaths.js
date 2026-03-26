export function encodePathSegment(value) {
    return encodeURIComponent(value);
}
export function encodeQueryValue(value) {
    return encodeURIComponent(value);
}
export function buildControlPlanePath(controlPlaneId) {
    return `/control-planes/${encodePathSegment(controlPlaneId)}`;
}
export function buildControlPlaneEndpoint(controlPlaneId) {
    return buildControlPlanePath(controlPlaneId);
}
export function buildControlPlaneGroupMembershipsEndpoint(groupId, pageSize = 10, pageAfter) {
    let endpoint = `${buildControlPlanePath(groupId)}/group-memberships?page[size]=${pageSize}`;
    if (pageAfter) {
        endpoint += `&page[after]=${encodeQueryValue(pageAfter)}`;
    }
    return endpoint;
}
export function buildControlPlaneGroupMemberStatusEndpoint(controlPlaneId) {
    return `${buildControlPlanePath(controlPlaneId)}/group-member-status`;
}
export function buildControlPlaneCoreEntitiesEndpoint(controlPlaneId, entity) {
    return `${buildControlPlanePath(controlPlaneId)}/core-entities/${entity}`;
}
export function buildControlPlaneCoreEntitiesListEndpoint(controlPlaneId, entity, size, offset) {
    let endpoint = `${buildControlPlaneCoreEntitiesEndpoint(controlPlaneId, entity)}?size=${size}`;
    if (offset) {
        endpoint += `&offset=${encodeQueryValue(offset)}`;
    }
    return endpoint;
}
