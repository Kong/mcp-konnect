import * as prompts from "./prompts.js";
import * as parameters from "./parameters.js";
export const tools = () => [
    // =========================
    // API Requests Analytics Tools
    // =========================
    {
        method: "query_api_requests",
        name: "Query API Requests",
        description: prompts.queryApiRequestsPrompt(),
        parameters: parameters.queryApiRequestsParameters(),
        category: "analytics"
    },
    {
        method: "get_consumer_requests",
        name: "Get Consumer Requests",
        description: prompts.getConsumerRequestsPrompt(),
        parameters: parameters.getConsumerRequestsParameters(),
        category: "analytics"
    },
    // =========================
    // Control Planes Configuration Tools
    // =========================
    {
        method: "list_services",
        name: "List Services",
        description: prompts.listServicesPrompt(),
        parameters: parameters.listServicesParameters(),
        category: "configuration"
    },
    {
        method: "list_routes",
        name: "List Routes",
        description: prompts.listRoutesPrompt(),
        parameters: parameters.listRoutesParameters(),
        category: "configuration"
    },
    {
        method: "list_consumers",
        name: "List Consumers",
        description: prompts.listConsumersPrompt(),
        parameters: parameters.listConsumersParameters(),
        category: "configuration"
    },
    {
        method: "list_plugins",
        name: "List Plugins",
        description: prompts.listPluginsPrompt(),
        parameters: parameters.listPluginsParameters(),
        category: "configuration"
    },
    // =========================
    // Control Planes Tools
    // =========================
    {
        method: "list_control_planes",
        name: "List Control Planes",
        description: prompts.listControlPlanesPrompt(),
        parameters: parameters.listControlPlanesParameters(),
        category: "control_planes"
    },
    {
        method: "get_control_plane",
        name: "Get Control Plane",
        description: prompts.getControlPlanePrompt(),
        parameters: parameters.getControlPlaneParameters(),
        category: "control_planes"
    },
    {
        method: "list_control_plane_group_memberships",
        name: "List Control Plane Group Memberships",
        description: prompts.listControlPlaneGroupMembershipsPrompt(),
        parameters: parameters.listControlPlaneGroupMembershipsParameters(),
        category: "control_planes"
    },
    {
        method: "check_control_plane_group_membership",
        name: "Check Control Plane Group Membership",
        description: prompts.checkControlPlaneGroupMembershipPrompt(),
        parameters: parameters.checkControlPlaneGroupMembershipParameters(),
        category: "control_planes"
    }
];
