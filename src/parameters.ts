import { z } from "zod";

// =========================
// Common Field Schemas
// =========================

/**
 * Standard time range options used across multiple tools.
 */
export const timeRangeSchema = z.enum(["15M", "1H", "6H", "12H", "24H", "7D"])
  .default("1H")
  .describe("Time range for data retrieval (15M = 15 minutes, 1H = 1 hour, etc.)");

/**
 * Standard pagination size parameter
 */
export const pageSizeSchema = z.number().int()
  .min(1).max(1000)
  .default(100)
  .describe("Number of items to return per page");

export const controlPlaneIdSchema = z.string()
  .uuid("Control plane identifiers must be valid UUIDs");

// =========================
// API Requests Analytics Schemas
// =========================

export const queryApiRequestsParameters = () => z.object({
  timeRange: timeRangeSchema,
  statusCodes: z.array(z.number().int().min(100).max(599))
    .optional()
    .describe("Filter by specific HTTP status codes (e.g. [200, 201, 404])"),
  excludeStatusCodes: z.array(z.number().int().min(100).max(599))
    .optional()
    .describe("Exclude specific HTTP status codes (e.g. [400, 401, 500])"),
  httpMethods: z.array(z.string())
    .optional()
    .describe("Filter by HTTP methods (e.g. ['GET', 'POST', 'DELETE'])"),
  consumerIds: z.array(z.string())
    .optional()
    .describe("Filter by consumer IDs"),
  serviceIds: z.array(z.string())
    .optional()
    .describe("Filter by service IDs"),
  routeIds: z.array(z.string())
    .optional()
    .describe("Filter by route IDs (from list-routes tool)"),
  maxResults: pageSizeSchema,
});

export const getConsumerRequestsParameters = () => z.object({
  consumerId: z.string()
    .describe("Consumer ID to filter by (obtainable from analyze-failed-requests or query-api-requests tools)"),
  timeRange: timeRangeSchema,
  successOnly: z.boolean()
    .default(false)
    .describe("Show only successful (2xx) requests"),
  failureOnly: z.boolean()
    .default(false)
    .describe("Show only failed (non-2xx) requests"),
  maxResults: pageSizeSchema,
});

// =========================
// Control Planes Configuration Schemas
// =========================

export const listServicesParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control Plane ID (obtainable from list-control-planes tool)"),
  size: z.number().int()
    .min(1).max(1000)
    .default(100)
    .describe("Number of services to return"),
  offset: z.string()
    .optional()
    .describe("Offset token for pagination (from previous response)"),
});

export const listRoutesParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control Plane ID (obtainable from list-control-planes tool)"),
  size: z.number().int()
    .min(1).max(1000)
    .default(100)
    .describe("Number of routes to return"),
  offset: z.string()
    .optional()
    .describe("Offset token for pagination (from previous response)"),
});

export const listConsumersParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control Plane ID (obtainable from list-control-planes tool)"),
  size: z.number().int()
    .min(1).max(1000)
    .default(100)
    .describe("Number of consumers to return"),
  offset: z.string()
    .optional()
    .describe("Offset token for pagination (from previous response)"),
});

export const listPluginsParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control Plane ID (obtainable from list-control-planes tool)"),
  size: z.number().int()
    .min(1).max(1000)
    .default(100)
    .describe("Number of plugins to return"),
  offset: z.string()
    .optional()
    .describe("Offset token for pagination (from previous response)"),
  includeRawConfig: z.boolean()
    .default(false)
    .describe("Include raw plugin configuration values. Disabled by default because configuration may contain sensitive data."),
});

// =========================
// Control Planes Tools
// =========================

export const listControlPlanesParameters = () => z.object({
  pageSize: z.number().int()
    .min(1).max(1000)
    .default(10)
    .describe("Number of control planes per page"),
  pageNumber: z.number().int()
    .min(1)
    .optional()
    .describe("Page number to retrieve"),
  filterName: z.string()
    .optional()
    .describe("Filter control planes by name (contains)"),
  filterClusterType: z.string()
    .optional()
    .describe("Filter by cluster type (e.g., 'kubernetes', 'docker')"),
  filterCloudGateway: z.boolean()
    .optional()
    .describe("Filter by cloud gateway capability"),
  labels: z.string()
    .optional()
    .describe("Filter by labels (format: 'key:value,existCheck')"),
  sort: z.string()
    .optional()
    .describe("Sort field and direction (e.g. 'name,created_at desc')"),
});

export const getControlPlaneParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control Plane ID (obtainable from list-control-planes tool)"),
});

export const listControlPlaneGroupMembershipsParameters = () => z.object({
  groupId: controlPlaneIdSchema
    .describe("Control plane group ID (the ID of the control plane that acts as the group)"),
  pageSize: z.number().int()
    .min(1).max(1000)
    .default(10)
    .describe("Number of members to return per page"),
  pageAfter: z.string()
    .optional()
    .describe("Cursor for pagination after a specific item"),
});

export const checkControlPlaneGroupMembershipParameters = () => z.object({
  controlPlaneId: controlPlaneIdSchema
    .describe("Control plane ID to check (can be obtained from list-control-planes tool)"),
});
