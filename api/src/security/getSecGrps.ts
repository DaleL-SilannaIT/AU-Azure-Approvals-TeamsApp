import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { InteractiveBrowserCredential } from "@azure/identity";

//This function limits the SQL query to records that the user has access to
export default async function fetchUserSecurityGroups(userUPN: string): Promise<string[]> {
    const credential = new InteractiveBrowserCredential({
        clientId: process.env.AAD_APP_CLIENT_ID!,
        tenantId: process.env.AAD_APP_TENANT_ID!,
    });

    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
        scopes: ["https://graph.microsoft.com/.default"],
    });

    const client = Client.initWithMiddleware({ authProvider });

    try {
        const response = await client.api(`/users/${userUPN}/memberOf`).get();
        const groups = response.value.map((group: any) => group.id);
        return groups;
    } catch (error) {
        console.error("Error fetching user security groups:", error);
        return [];
    }
}