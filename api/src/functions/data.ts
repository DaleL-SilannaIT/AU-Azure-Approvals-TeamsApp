import { app, HttpRequest, HttpResponseInit, InvocationContext, HttpMethod } from "@azure/functions";
import sql from 'mssql';
import { dbConfig } from '../database/dbConfig';
import { ApprovalRecordSet } from '../database/interfaces/approvalRecordSet';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../database/interfaces/filters';
import { FilterQueryBuilder } from "../database/filterQueryBuilder";
import { verifyJWT } from "../security/verifyJWT";
import getSecGrps from "../security/getSecGrps";

/**
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 */

export async function data(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  console.log("HTTP trigger function processed a request.");

  const token = req.headers.get('token');

  if (!token) {
    return {
      status: 400,
      jsonBody: { error: 'Missing header: \'token\'' }
    };
  }

  const claims = await verifyJWT(token);
  //console.log('Decoded token:', claims); // Debugging log

  const secGrps = [] //await getSecGrps(claims?.upn);
  //console.log('User security groups:', secGrps); // Debugging log

  let poolConnection: sql.ConnectionPool | null = null;
  console.log("Starting function execution");

  try {
    console.log("Connecting to database");
    poolConnection = await sql.connect(dbConfig);

    // Parse form-data parameters
    const params = await req.formData();
    console.log("Form data parameters:", params);
    const sortField = params.get('sortField') as keyof ApprovalRecordSet | undefined;
    const sortOrder = params.get('sortOrder') === 'DESC' ? 'DESC' : 'ASC';
    console.log('Sort field:', sortField, 'Sort order:', sortOrder);
    const topCount = params.get('topCount') ? parseInt(params.get('topCount') as string) : 50;
    const skipCount = params.get('skipCount') ? parseInt(params.get('skipCount') as string) : 0;
    let approvalRecordFilters: ApprovalRecordFilters[] = [];
    let approvalGroupFilters: ApprovalGroupFilters[] = [];
    let approvalUserFilters: ApprovalUserFilters = {
      requestersFilters: {
        tableName: "Approval_Users",
        columnName: 'object_id',
        operator: '=',
        value: '[]',
        value_type: 'string_array'
      },
      approversFilters: {
        tableName: "Approval_Users",
        columnName: 'object_id',
        operator: '=',
        value: '[]',
        value_type: 'string_array'
      }
    };

    try {
      approvalRecordFilters = JSON.parse(params.get('approvalRecordFilters') as string) as ApprovalRecordFilters[];
      const approvalUserFiltersString = params.get('approvalUserFilters') as string;
      console.log('approvalUserFilters string:', approvalUserFiltersString);
      approvalUserFilters = JSON.parse(approvalUserFiltersString) as ApprovalUserFilters;
      
    } catch (err) {
      console.log("Invalid filter data:", err);
      return {
        status: 400,
        jsonBody: { error: 'Invalid filter data' }
      };
    }

    const approvalFilters: ApprovalFilters = { approvalRecordFilters, approvalGroupFilters, approvalUserFilters, topCount, sortField, sortOrder, skipCount };
    let query = ``;
    query = await FilterQueryBuilder(approvalFilters, claims.payload.oid, secGrps);
    console.log("Constructed query:", query);

    const resultSet = await poolConnection.request().query(query);
    console.log("Query executed", resultSet);
    console.log(`${resultSet.recordset.length} rows returned.`);

    // Close connection only when we're certain application is finished
    poolConnection.close();
    console.log("Database connection closed");

    return {
      status: 200,
      jsonBody: resultSet.recordset
    };
  } catch (err) {
    console.log('Function error:', err);
    return {
      status: 500,
      jsonBody: { error: err instanceof Error ? err.message : 'Unknown error' }
    };
  } finally {
    if (poolConnection) {
      try {
        await poolConnection.close();
        console.log("Database connection closed in finally block");
      } catch (closeErr) {
        console.log('Error closing connection:', closeErr);
      }
    }
  }
}

app.http("data", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: data,
});