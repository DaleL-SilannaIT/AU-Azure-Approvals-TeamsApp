import { app, HttpRequest, HttpResponseInit, InvocationContext, HttpMethod } from "@azure/functions";
import sql from 'mssql';
import { dbConfig } from '../../database/dbConfig';
import { ApprovalRecord } from '../../database/interfaces/approvalRecord';

const functionConfig: { methods: HttpMethod[], authLevel: "function" | "anonymous" | "admin", route: string, handler: (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit> } = {
  methods: ["POST"],  // Change to POST to accept form-data
  authLevel: "anonymous",
  route: "data",  // Explicit route
  handler: async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    let poolConnection: sql.ConnectionPool | null = null;
    
    try {
      poolConnection = await sql.connect(dbConfig);

      // Parse form-data parameters
      const params = await req.formData();
      const filters = {};
      const sortField = params.get('sortField') as keyof ApprovalRecord | undefined;
      const sortOrder = params.get('sortOrder') === 'desc' ? 'DESC' : 'ASC';

      // Build filters object
      for (const key of params.keys()) {
        if (key in filters) {
          filters[key as keyof ApprovalRecord] = params.get(key) as string;
        }
      }

      // Construct SQL query
      let query = 'SELECT TOP 50 * FROM Approvals';
      const filterConditions = Object.entries(filters).map(([key, value]) => `${key} = '${value}'`);
      if (filterConditions.length > 0) {
        query += ' WHERE ' + filterConditions.join(' AND ');
      }
      if (sortField) {
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      }

      console.log("Executing query:", query);
      const resultSet = await poolConnection.request().query(query);

      console.log(`${resultSet.recordset.length} rows returned.`);

      // Close connection only when we're certain application is finished
      poolConnection.close();

      return {
        status: 200,
        jsonBody: resultSet.recordset
      };
    } catch (err) {
      context.log('Function error:', err);
      return {
        status: 500,
        jsonBody: { error: err instanceof Error ? err.message : 'Unknown error' }
      };
    } finally {
      if (poolConnection) {
        poolConnection.close();
      }
    }
  }
};

app.http('getApprovals', functionConfig);