import { app, HttpRequest, HttpResponseInit, InvocationContext, HttpMethod } from "@azure/functions";
import sql from 'mssql';
import { dbConfig } from '../database/dbConfig';
import { ApprovalRecord } from '../database/interfaces/approvalRecord';
import { ApprovalFilters, ApprovalRecordFilters, ApprovalGroupFilters, ApprovalUserFilters } from '../database/interfaces/filters';
import { FilterQueryBuilder } from "../database/queryBuilder";
import {verifyJWT} from "../security/verifyJWT";
import getSecGrps from "../security/getSecGrps";

/**
 * @param {HttpRequest} req - The HTTP request.
 * @param {InvocationContext} context - The Azure Functions context object.
 */


export async function data(
  req: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("HTTP trigger function processed a request.");

  const token = req.headers.get('token');

  if (!token) {
    return {
      status: 400,
      jsonBody: { error: 'Missing header: \'token\'' }
    };
  }

  const claims = verifyJWT(token);
  console.log('Decoded token:', claims); // Debugging log

  const secGrps = await getSecGrps(claims?.upn);
  console.log('User security groups:', secGrps); // Debugging log

  let poolConnection: sql.ConnectionPool | null = null;
  context.log("Starting function execution");

  try {
    context.log("Connecting to database");
    poolConnection = await sql.connect(dbConfig);

    // Parse form-data parameters
    const params = await req.formData();
    context.log("Form data parameters:", params);
    const sortField = params.get('sortField') as keyof ApprovalRecord | undefined;
    const sortOrder = params.get('sortOrder') === 'desc' ? 'DESC' : 'ASC';
    const topCount = params.get('topCount') ? parseInt(params.get('topCount') as string) : 2;
    const skipCount = params.get('skipCount') ? parseInt(params.get('skipCount') as string) : 0;
    let approvalRecordFilters = [];
    let approvalGroupFilters = [];
    let approvalUserFilters = [];

    try {
      approvalRecordFilters = JSON.parse(params.get('approvalRecordFilters') as string) as ApprovalRecordFilters[];
      approvalGroupFilters = JSON.parse(params.get('approvalGroupFilters') as string) as ApprovalGroupFilters[];
      approvalUserFilters = JSON.parse(params.get('approvalUserFilters') as string) as ApprovalUserFilters[];
      context.log("Parsed filters:", { approvalRecordFilters, approvalGroupFilters, approvalUserFilters });
    } catch (err) {
      console.error("Invalid filter data:", err);
      return {
        status: 400,
        jsonBody: { error: 'Invalid filter data' }
      };
    }

    const approvalFilters: ApprovalFilters = { approvalRecordFilters, approvalGroupFilters, approvalUserFilters, topCount, sortField, sortOrder, skipCount };
    let query = `SELECT TOP 50 * FROM Approvals`;
    context.log("Initial query:", query);
    query = await FilterQueryBuilder(approvalFilters,'',[]);
    context.log("Constructed query:", query);

    const resultSet = await poolConnection.request().query(query);
    context.log(`${resultSet.recordset.length} rows returned.`);

    // Close connection only when we're certain application is finished
    poolConnection.close();
    context.log("Database connection closed");

    return {
      status: 200,
      //jsonBody: resultSet.recordset
      jsonBody: query
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
// const functionConfig: { methods: HttpMethod[], authLevel: "function" | "anonymous" | "admin", route: string, handler: (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit> } = {
//   methods: ["POST"],  // Change to POST to accept form-data
//   authLevel: "anonymous",
//   route: "data",  // Explicit route
//   handler: async function data(req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
//     let poolConnection: sql.ConnectionPool | null = null;
//     context.log("Starting function execution");

//     try {
//       context.log("Connecting to database");
//       poolConnection = await sql.connect(dbConfig);

//       // Parse form-data parameters
//       const params = await req.formData();
//       context.log("Form data parameters:", params);
//       const sortField = params.get('sortField') as keyof ApprovalRecord | undefined;
//       const sortOrder = params.get('sortOrder') === 'desc' ? 'DESC' : 'ASC';
//       const topCount = params.get('topCount') ? parseInt(params.get('topCount') as string) : 50;
//       let approvalRecordFilters = [];
//       let approvalGroupFilters = [];
//       let approvalUserFilters = [];

//       try {
//         approvalRecordFilters = JSON.parse(params.get('approvalRecordFilters') as string) as ApprovalRecordFilters[];
//         approvalGroupFilters = JSON.parse(params.get('approvalGroupFilters') as string) as ApprovalGroupFilters[];
//         approvalUserFilters = JSON.parse(params.get('approvalUserFilters') as string) as ApprovalUserFilters[];
//         context.log("Parsed filters:", { approvalRecordFilters, approvalGroupFilters, approvalUserFilters });
//       } catch (err) {
//         console.error("Invalid filter data:", err);
//         return {
//           status: 400,
//           jsonBody: { error: 'Invalid filter data' }
//         };
//       }

//       const approvalFilters: ApprovalFilters = { approvalRecordFilters, approvalGroupFilters, approvalUserFilters, topCount, sortField, sortOrder };
//       let query = 'SELECT * FROM Approvals';
//       context.log("Initial query:", query);
//       query = FilterQueryBuilder(approvalFilters);
//       context.log("Constructed query:", query);

//       const resultSet = await poolConnection.request().query(query);
//       context.log(`${resultSet.recordset.length} rows returned.`);

//       // Close connection only when we're certain application is finished
//       poolConnection.close();
//       context.log("Database connection closed");

//       return {
//         status: 200,
//         //jsonBody: resultSet.recordset
//         jsonBody: query
//       };
//     } catch (err) {
//       console.error('Function error:', err);
//       return {
//         status: 500,
//         jsonBody: { error: err instanceof Error ? err.message : 'Unknown error' }
//       };
//     } finally {
//       if (poolConnection) {
//         try {
//           await poolConnection.close();
//           context.log("Database connection closed in finally block");
//         } catch (closeErr) {
//           console.error('Error closing connection:', closeErr);
//         }
//       }
//     }
//   }
// };

app.http("data", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: data,
});