// Import polyfills for fetch required by msgraph-sdk-javascript.
import "isomorphic-fetch";
import { app, InvocationContext, HttpRequest, HttpResponseInit } from "@azure/functions";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { AppCredential, AppCredentialAuthConfig } from "@microsoft/teamsfx";
import config from "../config";

const authConfig: AppCredentialAuthConfig = {
    authorityHost: config.authorityHost,
    clientId: config.clientId,
    tenantId: config.tenantId,
    clientSecret: config.clientSecret,
};

/**
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 */
export async function presence(
    req: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    console.log("HTTP trigger function processed a request - userPresence.");
    interface PresenceRequest {ids?: string[]}
    try {
        // Parse the request body
        const requestBody: PresenceRequest = await req.json();
        console.log('Request body:', requestBody);

        if (!requestBody.ids || !Array.isArray(requestBody.ids) || requestBody.ids.length === 0) {
            return {
                status: 400,
                jsonBody: {
                    error: "Request body must contain an 'ids' array with user object IDs"
                }
            };
        }

        let appCredential;
        try {
            appCredential = new AppCredential(authConfig);
        } catch (e) {
            context.error(e);
            return {
                status: 500,
                jsonBody: {
                    error:
                        "Failed to construct TeamsFx with Application Identity. " +
                        "Ensure your function app is configured with the right Azure AD App registration.",
                },
            };
        }

        // Create connection
        const authProvider = new TokenCredentialAuthenticationProvider(
            appCredential,
            {
                scopes: ["https://graph.microsoft.com/.default"],
            }
        );
        const graphClient: Client = Client.initWithMiddleware({
            authProvider: authProvider,
        });

        // Call Graph API with the correct request body structure
        const presenceResponse = await graphClient.api('/communications/getPresencesByUserId').post(requestBody);

        console.log('User presence response:', presenceResponse);
        return {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
            jsonBody: presenceResponse
        };
    } catch (e) {
        context.error(e);
        return {
            status: e?.statusCode ?? 500,
            jsonBody: {
                error: `Failed to fetch presence: ${e.toString()}`,
                details: e
            }
        };
    }
}

app.http("presence", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: presence,
});