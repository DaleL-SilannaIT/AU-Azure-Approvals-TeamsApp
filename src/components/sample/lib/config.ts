const config = {
  initiateLoginEndpoint: `${process.env.TAB_ENDPOINT}/auth-start.html`,
  clientId: process.env.AAD_APP_CLIENT_ID,
  apiEndpoint: process.env.API_FUNCTION_ENDPOINT,
  apiName: process.env.API_FUNCTION_GETUSERPROFILE,
};

export default config;
