import { KongApi } from "../api.js";

/**
 * List services for a specific control plane
 */
export async function listServices(
  api: KongApi,
  controlPlaneId: string,
  size = 100,
  offset?: string
) {
  try {
    const result = await api.listServices(controlPlaneId, size, offset);

    // Transform the response to have consistent field names
    return {
      metadata: {
        controlPlaneId: controlPlaneId,
        size: size,
        offset: offset || null,
        nextOffset: result.offset,
        totalCount: result.total
      },
      services: result.data.map((service: any) => ({
        serviceId: service.id,
        name: service.name,
        host: service.host,
        port: service.port,
        protocol: service.protocol,
        path: service.path,
        retries: service.retries,
        connectTimeout: service.connect_timeout,
        writeTimeout: service.write_timeout,
        readTimeout: service.read_timeout,
        tags: service.tags,
        clientCertificate: service.client_certificate,
        tlsVerify: service.tls_verify,
        tlsVerifyDepth: service.tls_verify_depth,
        caCertificates: service.ca_certificates,
        enabled: service.enabled,
        metadata: {
          createdAt: service.created_at,
          updatedAt: service.updated_at
        }
      })),
      relatedTools: [
        "Use list-routes to find routes that point to these services",
        "Use list-plugins to see plugins configured for these services"
      ]
    };
  } catch (error) {
    throw error;
  }
}

/**
 * List routes for a specific control plane
 */
export async function listRoutes(
  api: KongApi,
  controlPlaneId: string,
  size = 100,
  offset?: string
) {
  try {
    const result = await api.listRoutes(controlPlaneId, size, offset);

    // Transform the response to have consistent field names
    return {
      metadata: {
        controlPlaneId: controlPlaneId,
        size: size,
        offset: offset || null,
        nextOffset: result.offset,
        totalCount: result.total
      },
      routes: result.data.map((route: any) => ({
        routeId: route.id,
        name: route.name,
        protocols: route.protocols,
        methods: route.methods,
        hosts: route.hosts,
        paths: route.paths,
        https_redirect_status_code: route.https_redirect_status_code,
        regex_priority: route.regex_priority,
        stripPath: route.strip_path,
        preserveHost: route.preserve_host,
        requestBuffering: route.request_buffering,
        responseBuffering: route.response_buffering,
        tags: route.tags,
        serviceId: route.service?.id,
        enabled: route.enabled,
        metadata: {
          createdAt: route.created_at,
          updatedAt: route.updated_at
        }
      })),
      relatedTools: [
        "Use query-api-requests with specific routeIds to analyze traffic",
        "Use list-services to find details about the services these routes connect to",
        "Use list-plugins to see plugins configured for these routes"
      ]
    };
  } catch (error) {
    throw error;
  }
}

/**
 * List consumers for a specific control plane
 */
export async function listConsumers(
  api: KongApi,
  controlPlaneId: string,
  size = 100,
  offset?: string
) {
  try {
    const result = await api.listConsumers(controlPlaneId, size, offset);

    // Transform the response to have consistent field names
    return {
      metadata: {
        controlPlaneId: controlPlaneId,
        size: size,
        offset: offset || null,
        nextOffset: result.offset,
        totalCount: result.total
      },
      consumers: result.data.map((consumer: any) => ({
        consumerId: consumer.id,
        username: consumer.username,
        customId: consumer.custom_id,
        tags: consumer.tags,
        enabled: consumer.enabled,
        metadata: {
          createdAt: consumer.created_at,
          updatedAt: consumer.updated_at
        }
      })),
      relatedTools: [
        "Use get-consumer-requests to analyze traffic for a specific consumer",
        "Use list-plugins to see plugins configured for these consumers",
        "Use query-api-requests to identify consumers with high error rates"
      ]
    };
  } catch (error) {
    throw error;
  }
}

/**
 * List plugins for a specific control plane
 */
export async function listPlugins(
  api: KongApi,
  controlPlaneId: string,
  size = 100,
  offset?: string,
  includeRawConfig = false
) {
  try {
    const result = await api.listPlugins(controlPlaneId, size, offset);

    // Transform the response to have consistent field names
    return {
      metadata: {
        controlPlaneId: controlPlaneId,
        size: size,
        offset: offset || null,
        nextOffset: result.offset,
        totalCount: result.total,
        includeRawConfig,
        warnings: includeRawConfig
          ? [
              "Raw plugin config is included because includeRawConfig was explicitly enabled. Plugin configuration may contain sensitive values."
            ]
          : []
      },
      plugins: result.data.map((plugin: any) => {
        const basePlugin = {
          pluginId: plugin.id,
          name: plugin.name,
          enabled: plugin.enabled,
          protocols: plugin.protocols,
          tags: plugin.tags,
          scoping: {
            consumerId: plugin.consumer?.id,
            serviceId: plugin.service?.id,
            routeId: plugin.route?.id,
            global: (!plugin.consumer && !plugin.service && !plugin.route)
          },
          metadata: {
            createdAt: plugin.created_at,
            updatedAt: plugin.updated_at
          }
        };

        if (includeRawConfig) {
          return {
            ...basePlugin,
            configIncluded: true,
            config: plugin.config
          };
        }

        const config = plugin.config && typeof plugin.config === "object" ? plugin.config : {};

        return {
          ...basePlugin,
          configIncluded: false,
          configKeys: Object.keys(config),
          configEntryCount: Object.keys(config).length
        };
      }),
      relatedTools: [
        "Use list-services and list-routes to find entities these plugins are applied to",
        "Use query-api-requests to analyze traffic affected by these plugins"
      ]
    };
  } catch (error) {
    throw error;
  }
}
