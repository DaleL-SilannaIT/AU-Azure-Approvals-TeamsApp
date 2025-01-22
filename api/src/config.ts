const config = {
  authorityHost: process.env.M365_AUTHORITY_HOST,
  tenantId: process.env.M365_TENANT_ID,
  clientId: process.env.M365_CLIENT_ID,
  clientSecret: process.env.M365_CLIENT_SECRET,
  hostname: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  db_username: process.env.DB_USER,
  db_password: process.env.DB_PASSWORD,
};

export default config;
