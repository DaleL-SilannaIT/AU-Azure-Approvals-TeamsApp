import { app, HttpRequest, HttpResponseInit, InvocationContext, HttpMethod } from "@azure/functions";
import sql from 'mssql';
import { dbConfig } from '../../database/dbConfig';

const functionConfig: { methods: HttpMethod[], authLevel: "function" | "anonymous" | "admin", route: string, handler: (req: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit> } = {
  methods: ["GET"],  // Add GET for easier testing
  authLevel: "anonymous",
  route: "data",  // Explicit route
  handler: async function (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    let poolConnection: sql.ConnectionPool | null = null;
    
    try {
      poolConnection = await sql.connect(dbConfig);

        console.log("Reading rows from the Table...");
        var resultSet = await poolConnection.request().query(`SELECT * FROM Approvals`);

        console.log(`${resultSet.recordset.length} rows returned.`);

        // output column headers
        var columns = "";
        for (var column in resultSet.recordset.columns) {
            columns += column + ", ";
        }
        console.log("%s\t", columns.substring(0, columns.length - 2));

        // output row contents from default record set
        resultSet.recordset.forEach(row => {
            console.log("%s\t%s", row.id, row.title);
        });

        // close connection only when we're certain application is finished
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
      if (poolConnection) await poolConnection.close();
    }
  }
};

app.http("data", {
  methods: functionConfig.methods,
  authLevel: functionConfig.authLevel,
  handler: functionConfig.handler,
});