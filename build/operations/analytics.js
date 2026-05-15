import { normalizeUntrustedText } from "../untrustedText.js";
const QUERY_API_REQUESTS_UNTRUSTED_FIELDS = [
    "requests[].uri",
    "requests[].headers.host",
    "requests[].headers.userAgent",
    "requests[].upstreamUri"
];
const GET_CONSUMER_REQUESTS_UNTRUSTED_FIELDS = [
    "requests[].uri"
];
/**
 * Standard response time formatter for consistent formatting
 */
export function formatResponseTimes(data) {
    return {
        latencyMs: {
            total: data.latencies_response_ms,
            gateway: data.latencies_kong_gateway_ms,
            upstream: data.latencies_upstream_ms
        }
    };
}
/**
 * Process and format the API requests data
 */
export async function queryApiRequests(api, timeRange, statusCodes, excludeStatusCodes, httpMethods, consumerIds, serviceIds, routeIds, maxResults = 100) {
    try {
        // Build filters array
        const filters = [];
        // Add status code filters
        if (statusCodes && statusCodes.length > 0) {
            filters.push({
                field: "status_code",
                operator: "in",
                value: statusCodes
            });
        }
        if (excludeStatusCodes && excludeStatusCodes.length > 0) {
            filters.push({
                field: "status_code",
                operator: "not_in",
                value: excludeStatusCodes
            });
        }
        // Add HTTP method filters
        if (httpMethods && httpMethods.length > 0) {
            filters.push({
                field: "http_method",
                operator: "in",
                value: httpMethods
            });
        }
        // Add consumer filters
        if (consumerIds && consumerIds.length > 0) {
            filters.push({
                field: "consumer",
                operator: "in",
                value: consumerIds
            });
        }
        // Add service filters
        if (serviceIds && serviceIds.length > 0) {
            filters.push({
                field: "gateway_service",
                operator: "in",
                value: serviceIds
            });
        }
        // Add route filters
        if (routeIds && routeIds.length > 0) {
            filters.push({
                field: "route",
                operator: "in",
                value: routeIds
            });
        }
        const result = await api.queryApiRequests(timeRange, filters, maxResults);
        // Format the response with a consistent structure
        return {
            metadata: {
                totalRequests: result.meta.size,
                timeRange: {
                    start: result.meta.time_range.start,
                    end: result.meta.time_range.end,
                },
                filters: filters,
                untrustedFields: QUERY_API_REQUESTS_UNTRUSTED_FIELDS,
                untrustedFieldTrust: "untrusted_external_input"
            },
            requests: result.results.map(req => ({
                requestId: req.request_id,
                timestamp: req.request_start,
                httpMethod: req.http_method,
                uri: normalizeUntrustedText(req.request_uri),
                statusCode: req.status_code || req.response_http_status,
                consumerId: req.consumer,
                serviceId: req.gateway_service,
                routeId: req.route,
                latency: {
                    totalMs: req.latencies_response_ms,
                    gatewayMs: req.latencies_kong_gateway_ms,
                    upstreamMs: req.latencies_upstream_ms
                },
                clientIp: req.client_ip,
                apiProduct: req.api_product,
                apiProductVersion: req.api_product_version,
                applicationId: req.application,
                authType: req.auth_type,
                headers: {
                    host: normalizeUntrustedText(req.header_host),
                    userAgent: normalizeUntrustedText(req.header_user_agent)
                },
                dataPlane: {
                    nodeId: req.data_plane_node,
                    version: req.data_plane_node_version
                },
                controlPlane: {
                    id: req.control_plane,
                    group: req.control_plane_group
                },
                rateLimiting: {
                    enabled: req.ratelimit_enabled,
                    limit: req.ratelimit_limit,
                    remaining: req.ratelimit_remaining,
                    reset: req.ratelimit_reset,
                    byTimeUnit: {
                        second: {
                            enabled: req.ratelimit_enabled_second,
                            limit: req.ratelimit_limit_second,
                            remaining: req.ratelimit_remaining_second
                        },
                        minute: {
                            enabled: req.ratelimit_enabled_minute,
                            limit: req.ratelimit_limit_minute,
                            remaining: req.ratelimit_remaining_minute
                        },
                        hour: {
                            enabled: req.ratelimit_enabled_hour,
                            limit: req.ratelimit_limit_hour,
                            remaining: req.ratelimit_remaining_hour
                        },
                        day: {
                            enabled: req.ratelimit_enabled_day,
                            limit: req.ratelimit_limit_day,
                            remaining: req.ratelimit_remaining_day
                        },
                        month: {
                            enabled: req.ratelimit_enabled_month,
                            limit: req.ratelimit_limit_month,
                            remaining: req.ratelimit_remaining_month
                        },
                        year: {
                            enabled: req.ratelimit_enabled_year,
                            limit: req.ratelimit_limit_year,
                            remaining: req.ratelimit_remaining_year
                        }
                    }
                },
                service: {
                    port: req.service_port,
                    protocol: req.service_protocol
                },
                requestBodySize: req.request_body_size,
                responseBodySize: req.response_body_size,
                responseHeaders: {
                    contentType: req.response_header_content_type,
                    contentLength: req.response_header_content_length
                },
                traceId: req.trace_id,
                upstreamUri: normalizeUntrustedText(req.upstream_uri),
                upstreamStatus: req.upstream_status,
                recommendations: [
                    "Use 'get-consumer-requests' tool with consumerId from top failing consumers for more details",
                    "Check 'query-api-requests' with specific status codes for deeper investigation"
                ]
            }))
        };
    }
    catch (error) {
        throw error;
    }
}
/**
 * Retrieve and analyze requests for a specific consumer
 */
export async function getConsumerRequests(api, consumerId, timeRange, successOnly = false, failureOnly = false, maxResults = 100) {
    try {
        // Build filters array
        const filters = [
            {
                field: "consumer",
                operator: "in",
                value: [consumerId]
            }
        ];
        // Add status code filter if needed
        if (successOnly) {
            filters.push({
                field: "status_code_grouped",
                operator: "in",
                value: ["2XX"]
            });
        }
        else if (failureOnly) {
            filters.push({
                field: "status_code_grouped",
                operator: "in",
                value: ["4XX", "5XX"]
            });
        }
        const result = await api.queryApiRequests(timeRange, filters, maxResults);
        // Calculate some statistics if we have results
        let avgLatency = 0;
        let successRate = 0;
        let statusCodeCounts = {};
        let serviceBreakdown = {};
        if (result.results.length > 0) {
            // Calculate average latency
            avgLatency = result.results.reduce((sum, req) => sum + (req.latencies_response_ms || 0), 0) / result.results.length;
            // Calculate success rate
            const successCount = result.results.filter(req => {
                const status = req.status_code ?? req.response_http_status ?? 0; // Default to 0 if both are undefined
                return status >= 200 && status < 300;
            }).length;
            successRate = (successCount / result.results.length) * 100;
            // Count status codes
            result.results.forEach(req => {
                const status = req.status_code ?? req.response_http_status ?? 0; // Default to 0 if both are undefined
                statusCodeCounts[status] = (statusCodeCounts[status] || 0) + 1;
            });
            // Service breakdown
            result.results.forEach(req => {
                const service = req.gateway_service ?? "unknown"; // Using ?? instead of || for null/undefined handling
                if (!serviceBreakdown[service]) {
                    serviceBreakdown[service] = { count: 0, statusCodes: {} };
                }
                serviceBreakdown[service].count++;
                const status = req.status_code ?? req.response_http_status ?? 0; // Default to 0 if both are undefined
                serviceBreakdown[service].statusCodes[status] = (serviceBreakdown[service].statusCodes[status] || 0) + 1;
            });
        }
        // Format the response in a readable way
        return {
            metadata: {
                consumerId: consumerId,
                totalRequests: result.results.length,
                timeRange: {
                    start: result.meta.time_range.start,
                    end: result.meta.time_range.end,
                },
                filters: {
                    successOnly,
                    failureOnly
                },
                untrustedFields: GET_CONSUMER_REQUESTS_UNTRUSTED_FIELDS,
                untrustedFieldTrust: "untrusted_external_input"
            },
            statistics: {
                averageLatencyMs: parseFloat(avgLatency.toFixed(2)),
                successRate: parseFloat(successRate.toFixed(2)),
                statusCodeDistribution: Object.entries(statusCodeCounts).map(([code, count]) => ({
                    statusCode: parseInt(code),
                    count: count,
                    percentage: parseFloat(((count / result.results.length) * 100).toFixed(2))
                })).sort((a, b) => b.count - a.count),
                serviceDistribution: Object.entries(serviceBreakdown).map(([service, data]) => ({
                    serviceId: service,
                    count: data.count,
                    percentage: parseFloat(((data.count / result.results.length) * 100).toFixed(2)),
                    statusCodeBreakdown: Object.entries(data.statusCodes).map(([code, count]) => ({
                        statusCode: parseInt(code),
                        count: count
                    })).sort((a, b) => b.count - a.count)
                })).sort((a, b) => b.count - a.count)
            },
            requests: result.results.map(req => ({
                timestamp: req.request_start,
                httpMethod: req.http_method,
                uri: normalizeUntrustedText(req.request_uri),
                statusCode: req.status_code || req.response_http_status,
                serviceId: req.gateway_service,
                routeId: req.route,
                latency: {
                    totalMs: req.latencies_response_ms,
                    gatewayMs: req.latencies_kong_gateway_ms,
                    upstreamMs: req.latencies_upstream_ms
                },
                clientIp: req.client_ip,
                traceId: req.trace_id
            }))
        };
    }
    catch (error) {
        throw error;
    }
}
