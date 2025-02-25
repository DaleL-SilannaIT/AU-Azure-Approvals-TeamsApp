import { app, HttpRequest, HttpResponseInit, InvocationContext, HttpMethod } from "@azure/functions";
import sql from 'mssql';
import { dbConfig } from '../database/dbConfig';
import { ApprovalRecord } from '../database/interfaces/approvalRecord';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../database/interfaces/filters';
import { RequestersQueryBuilder } from "../database/requestersQueryBuilder";
import {verifyJWT} from "../security/verifyJWT";
import getSecGrps from "../security/getSecGrps";

/**
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 */


export async function requesters(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("HTTP trigger function processed a request - requesters");

  const token = req.headers.get('token');

  if (!token) {
    return {
      status: 400,
      jsonBody: { error: 'Missing header: \'token\'' }
    };
  }

  const claims = await verifyJWT(token);

  const secGrps = [] //await getSecGrps(claims?.upn);
  //console.log('User security groups:', secGrps); // Debugging log

  let poolConnection: sql.ConnectionPool | null = null;
  console.log("Starting function execution - requesters");

  try {
    context.log("Connecting to database");
    poolConnection = await sql.connect(dbConfig);

    let query = RequestersQueryBuilder(claims.payload.oid);
    //console.log("Constructed query:", query);

    const resultSet = await poolConnection.request().query(query);

    // Close connection only when we're certain application is finished
    poolConnection.close();
    context.log("Database connection closed");

    console.log("Requesters:", resultSet.recordset);

    return {
      status: 200,
      jsonBody: resultSet.recordset
    };
  } catch (err) {
    console.error('Function error:', err);
    return {
      status: 500,
      jsonBody: { error: err instanceof Error ? err.message : 'Unknown error' }
    };
  } finally {
    if (poolConnection) {
      try {
        await poolConnection.close();
        context.log("Database connection closed in finally block");
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
  }
}

app.http("requesters", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: requesters,
});