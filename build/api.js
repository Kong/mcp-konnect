import axios from "axios";
import { buildControlPlaneCoreEntitiesListEndpoint, buildControlPlaneEndpoint, buildControlPlaneGroupMemberStatusEndpoint, buildControlPlaneGroupMembershipsEndpoint } from "./apiPaths.js";
/**
 * Kong API Regions - Different geographical API endpoints
 */
export const API_REGIONS = {
    US: "us",
    EU: "eu",
    AU: "au",
    ME: "me",
    IN: "in",
};
export class KongApi {
    baseUrl;
    apiKey;
    requestTimeoutMs;
    constructor(options = {}) {
        // Default to US region if not specified
        const apiRegion = options.apiRegion || process.env.KONNECT_REGION || API_REGIONS.US;
        this.baseUrl = `https://${apiRegion}.api.konghq.com/v2`;
        this.apiKey = options.apiKey || process.env.KONNECT_ACCESS_TOKEN || "";
        this.requestTimeoutMs = this.resolveRequestTimeoutMs(options.requestTimeoutMs);
        if (!this.apiKey) {
            console.error("Warning: KONNECT_ACCESS_TOKEN not set in environment. API calls will fail.");
        }
    }
    resolveRequestTimeoutMs(explicitTimeoutMs) {
        if (explicitTimeoutMs !== undefined) {
            return explicitTimeoutMs;
        }
        const configuredTimeout = process.env.KONNECT_REQUEST_TIMEOUT_MS;
        if (!configuredTimeout) {
            return 30000;
        }
        const parsedTimeout = Number.parseInt(configuredTimeout, 10);
        if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
            console.error("Warning: KONNECT_REQUEST_TIMEOUT_MS must be a positive integer. Falling back to 30000ms.");
            return 30000;
        }
        return parsedTimeout;
    }
    /**
     * Makes authenticated requests to Kong APIs with consistent error handling
     */
    async kongRequest(endpoint, method = "GET", data = null) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            console.error(`Making request to: ${url}`);
            const headers = {
                "Authorization": `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
                "Accept": "application/json"
            };
            const config = {
                method,
                url,
                headers,
                timeout: this.requestTimeoutMs,
                data: data ? data : undefined,
            };
            const response = await axios(config);
            console.error(`Received response with status: ${response.status}`);
            return response.data;
        }
        catch (error) {
            console.error("API request error:", error.message);
            if (error.response) {
                const errorData = error.response.data;
                let errorMessage = `API Error (Status ${error.response.status})`;
                if (typeof errorData === 'object') {
                    const errorDetails = errorData.message || JSON.stringify(errorData);
                    errorMessage += `: ${errorDetails}`;
                }
                else if (typeof errorData === 'string') {
                    errorMessage += `: ${errorData.substring(0, 200)}`;
                }
                throw new Error(errorMessage);
            }
            else if (error.code === "ECONNABORTED") {
                throw new Error(`Request timed out after ${this.requestTimeoutMs}ms while calling the Kong API.`);
            }
            else if (error.request) {
                throw new Error("Network Error: No response received from Kong API. Please check your network connection and API endpoint configuration.");
            }
            else {
                throw new Error(`Request Error: ${error.message}. Please check your request parameters and try again.`);
            }
        }
    }
    // Analytics API methods
    async queryApiRequests(timeRange, filters = [], maxResults = 100) {
        const requestBody = {
            time_range: {
                type: "relative",
                time_range: timeRange
            },
            filters: filters,
            size: maxResults
        };
        return this.kongRequest("/api-requests", "POST", requestBody);
    }
    // Control Planes API methods
    async listControlPlanes(pageSize = 10, pageNumber, filterName, filterClusterType, filterCloudGateway, labels, sort) {
        let endpoint = `/control-planes?page[size]=${pageSize}`;
        if (pageNumber) {
            endpoint += `&page[number]=${pageNumber}`;
        }
        if (filterName) {
            endpoint += `&filter[name][contains]=${encodeURIComponent(filterName)}`;
        }
        if (filterClusterType) {
            endpoint += `&filter[cluster_type][eq]=${encodeURIComponent(filterClusterType)}`;
        }
        if (filterCloudGateway !== undefined) {
            endpoint += `&filter[cloud_gateway]=${filterCloudGateway}`;
        }
        if (labels) {
            endpoint += `&labels=${encodeURIComponent(labels)}`;
        }
        if (sort) {
            endpoint += `&sort=${encodeURIComponent(sort)}`;
        }
        return this.kongRequest(endpoint);
    }
    async getControlPlane(controlPlaneId) {
        return this.kongRequest(buildControlPlaneEndpoint(controlPlaneId));
    }
    async listControlPlaneGroupMemberships(groupId, pageSize = 10, pageAfter) {
        return this.kongRequest(buildControlPlaneGroupMembershipsEndpoint(groupId, pageSize, pageAfter));
    }
    async checkControlPlaneGroupMembership(controlPlaneId) {
        return this.kongRequest(buildControlPlaneGroupMemberStatusEndpoint(controlPlaneId));
    }
    // Configuration API methods
    async listServices(controlPlaneId, size = 100, offset) {
        return this.kongRequest(buildControlPlaneCoreEntitiesListEndpoint(controlPlaneId, "services", size, offset));
    }
    async listRoutes(controlPlaneId, size = 100, offset) {
        return this.kongRequest(buildControlPlaneCoreEntitiesListEndpoint(controlPlaneId, "routes", size, offset));
    }
    async listConsumers(controlPlaneId, size = 100, offset) {
        return this.kongRequest(buildControlPlaneCoreEntitiesListEndpoint(controlPlaneId, "consumers", size, offset));
    }
    async listPlugins(controlPlaneId, size = 100, offset) {
        return this.kongRequest(buildControlPlaneCoreEntitiesListEndpoint(controlPlaneId, "plugins", size, offset));
    }
}
