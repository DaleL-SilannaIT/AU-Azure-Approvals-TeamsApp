import * as sql from 'mssql';
import * as dotenv from 'dotenv';

dotenv.config();

export const dbConfig: sql.config = {
    user: 'au-azure', // better stored in an app setting such as process.env.DB_USER
    password: 'jzYEFr6REPCKZBBuo9Cs', // better stored in an app setting such as process.env.DB_PASSWORD
    server: 'silanna-approvals.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
    port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
    database: 'Silanna-Approvals', // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
  }