# Kong Konnect MCP Server

![Static Badge](https://img.shields.io/badge/Release-Tech%20Preview-FFA500?style=plastic)

A Model Context Protocol (MCP) server for interacting with Kong Konnect APIs, allowing AI assistants to query and analyze Kong Gateway configurations, traffic, and analytics.


https://github.com/user-attachments/assets/19c2f716-49b5-46c3-9457-65b3784e2111


## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
  - [Analytics Tools](#analytics-tools)
  - [Configuration Tools](#configuration-tools) 
  - [Control Planes Tools](#control-planes-tools)
- [Usage with Claude](#usage-with-claude)
- [Example Workflows](#example-workflows)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Overview

This project provides a Model Context Protocol (MCP) server that enables AI assistants like Claude to interact with Kong Konnect's API Gateway. It offers a set of tools to query analytics data, inspect configuration details, and manage control planes through natural language conversation.

Key features:
- Query API request analytics with customizable filters
- List and inspect gateway services, routes, consumers, and plugins
- Manage control planes and control plane groups
- Integration with Claude and other MCP-compatible AI assistants

Konnect MCP is a **work in progress** and we will be adding additional functionality and improvements with each release.

## Project Structure

```
src/
├── index.ts              # Main entry point
├── api.ts                # Kong API client
├── tools.ts              # Tool definitions
├── parameters.ts         # Zod schemas for tool parameters
├── prompts.ts            # Detailed tool documentation
├── operations/
│   ├── analytics.ts      # API request analytics operations
│   ├── configuration.ts  # Services, routes, consumers, plugins
│   └── controlPlanes.ts  # Control plane management
└── types.ts              # Common type definitions
```

## Installation

### Prerequisites
- Node.js 20 or higher
- A Kong Konnect account with API access
- A client with MCP capabilities (e.g. Claude Desktop, Cursor, etc...)

### Setup

```bash
# Clone the repository
git clone https://github.com/Kong/mcp-konnect.git
cd mcp-konnect

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Set the following environment variables to configure the MCP server:

```bash
# Required: Your Kong Konnect API key
export KONNECT_ACCESS_TOKEN=kpat_api_key_here

# Optional: The API region to use (defaults to US)
# Possible values: US, EU, AU, ME, IN
export KONNECT_REGION=us
```

## Running with Docker (Alternative)

You can also build and run this server using Docker.

### Building the Docker Image

```bash
docker build -t kong-konnect-mcp .
```

### Running the Docker Container (Manual / Standalone)

This command runs the Docker container directly from your terminal. This is useful for:
*   **Testing:** Verifying that the image builds and the server starts correctly.
*   **Standalone Use:** Running the server independently if needed for other purposes or if you prefer managing it separately.

**Note:** This is *different* from the configuration used by Claude Desktop (see `Usage with Claude` section below). Claude Desktop will manage starting and stopping the container itself based on its configuration.

To run manually:
```bash
docker run --rm -i --name kong-mcp-manual \
  -e KONNECT_ACCESS_TOKEN="kpat_api_key_here" \
  -e KONNECT_REGION="us" \
  kong-konnect-mcp
```

*   `--rm`: Automatically remove the container when it exits.
*   `-i`: Keep STDIN open even if not attached (necessary for MCP over stdio).
*   `--name kong-mcp-manual`: Assigns a specific name to the container, making it easier to stop later.
*   `-e KONNECT_ACCESS_TOKEN="..."`: Sets the required API key.
*   `-e KONNECT_REGION="..."`: Sets the region (optional, defaults to `us`).
*   `kong-konnect-mcp`: The name of the image you built.

**Stopping the Manually Run Container:**

If you started the container manually with the `--name` flag as shown above, you can stop it using:

```bash
docker stop kong-mcp-manual
```

If you didn't use `--name`, you can list running containers to find its ID or name:

```bash
docker ps
```

Then stop it using its Container ID or Name:

```bash
docker stop <CONTAINER_ID_OR_NAME>
```

## Available Tools

The server provides tools organized in three categories:

### Analytics Tools

#### Query API Requests
Query and analyze Kong API Gateway requests with customizable filters.

```
Inputs:
- timeRange: Time range for data retrieval (15M, 1H, 6H, 12H, 24H, 7D)
- statusCodes: Filter by specific HTTP status codes
- excludeStatusCodes: Exclude specific HTTP status codes
- httpMethods: Filter by HTTP methods
- consumerIds: Filter by consumer IDs
- serviceIds: Filter by service IDs
- routeIds: Filter by route IDs
- maxResults: Maximum number of results to return
```

#### Get Consumer Requests
Analyze API requests made by a specific consumer.

```
Inputs:
- consumerId: ID of the consumer to analyze
- timeRange: Time range for data retrieval
- successOnly: Show only successful (2xx) requests
- failureOnly: Show only failed (non-2xx) requests
- maxResults: Maximum number of results to return
```

### Configuration Tools

#### List Services
List all services associated with a control plane.

```
Inputs:
- controlPlaneId: ID of the control plane
- size: Number of services to return
- offset: Pagination offset token
```

#### List Routes
List all routes associated with a control plane.

```
Inputs:
- controlPlaneId: ID of the control plane
- size: Number of routes to return
- offset: Pagination offset token
```

#### List Consumers
List all consumers associated with a control plane.

```
Inputs:
- controlPlaneId: ID of the control plane
- size: Number of consumers to return
- offset: Pagination offset token
```

#### List Plugins
List all plugins associated with a control plane.

```
Inputs:
- controlPlaneId: ID of the control plane
- size: Number of plugins to return
- offset: Pagination offset token
```

### Control Planes Tools

#### List Control Planes
List all control planes in your organization.

```
Inputs:
- pageSize: Number of control planes per page
- pageNumber: Page number to retrieve
- filterName: Filter control planes by name
- filterClusterType: Filter by cluster type
- filterCloudGateway: Filter by cloud gateway capability
- labels: Filter by labels
- sort: Sort field and direction
```

#### Get Control Plane
Get detailed information about a specific control plane.

```
Inputs:
- controlPlaneId: ID of the control plane to retrieve
```

#### List Control Plane Group Memberships
List all control planes that are members of a specific group.

```
Inputs:
- groupId: Control plane group ID
- pageSize: Number of members to return per page
- pageAfter: Cursor for pagination
```

#### Check Control Plane Group Membership
Check if a control plane is a member of any group.

```
Inputs:
- controlPlaneId: Control plane ID to check
```

## Usage with Claude

To use this MCP server with Claude for Desktop:

1. Install [Claude for Desktop](https://claude.ai/download)
2. Create or edit the Claude Desktop configuration file:
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

3. Add **one** of the following configurations, depending on whether you run the server directly with Node or via Docker:

    **Option A: Running directly with Node (after `npm install` and `npm run build`)**

    ```json
    {
      "mcpServers": {
        "kong-konnect": {
          "command": "node",
          "args": [
            "/absolute/path/to/mcp-konnect/build/index.js"
          ],
          "env": {
            "KONNECT_ACCESS_TOKEN": "kpat_api_key_here",
            "KONNECT_REGION": "us"
          }
        }
      }
    }
    ```
    *Ensure you replace `/absolute/path/to/mcp-konnect` with the correct path on your system.*

    **Option B: Running with Docker (after `docker build`)**

    ```json
    {
      "mcpServers": {
        "kong-konnect": {
          "command": "docker",
          "args": [
            "run", "--rm", "-i",
            "-e", "KONNECT_ACCESS_TOKEN=kpat_api_key_here",
            "-e", "KONNECT_REGION=us",
            "kong-konnect-mcp"
          ],
          "env": {}
        }
      }
    }
    ```
    *Ensure your `KONNECT_ACCESS_TOKEN` is correctly set within the `args` array.*

4. Restart Claude for Desktop
5. The Kong Konnect tools will now be available for Claude to use

## Example Workflows

### Analyzing API Traffic

1. First, list all control planes:
   ```
   Please list all control planes in my Kong Konnect organization.
   ```

2. Then, list services for a specific control plane:
   ```
   List all services for control plane [CONTROL_PLANE_NAME/ID].
   ```
   
3. Query API requests for a specific service:
   ```
   Show me all API requests for service [SERVICE_NAME/ID] in the last hour that had 5xx status codes.
   ```

### Troubleshooting Consumer Issues

1. List consumers for a control plane:
   ```
   List all consumers for control plane [CONTROL_PLANE_NAME/ID].
   ```

2. Analyze requests for a specific consumer:
   ```
   Show me all requests made by consumer [CONSUMER_NAME/ID] in the last 24 hours.
   ```

3. Check for common errors or patterns:
   ```
   What are the most common errors experienced by this consumer?
   ```

## Development

### Adding New Tools

1. Define the parameters in `parameters.ts`
2. Add documentation in `prompts.ts`
3. Create the operation logic in the appropriate file in `operations/`
4. Register the tool in `tools.ts`
5. Handle the tool execution in `index.ts`

## Troubleshooting

### Common Issues

**Connection Errors**
- Verify your API key is valid and has the necessary permissions
- Check that the API region is correctly specified
- Ensure your network can connect to the Kong Konnect API

**Authentication Errors**
- Regenerate your API key in the Kong Konnect portal
- Check that environment variables are correctly set

**Data Not Found**
- Verify the IDs used in requests are correct
- Check that the resources exist in the specified control plane
- Ensure time ranges are valid for analytics queries

## Credits

Built by Kong. Inspired by Stripe's [Agent Toolkit](https://github.com/stripe/agent-toolkit).
