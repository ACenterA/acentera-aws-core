const API_HOST = process.env.API_HOST || '127.0.0.1';
const DEV_ACCOUNT_ID = process.env.DEV_ACCOUNTID || '';
const ENV_CONFIG = process.env.ENV_CONFIG || 'remote';

module.exports = {
  NODE_ENV: '"development"',
  ENV_CONFIG: `"${ENV_CONFIG}"`,
  BASE_API: `"http://${API_HOST}:2000/api/"`,
  BASE_PLUGIN_URL: `"http://${API_HOST}:2000"`,
  GRAPHQL_LOCAL_URL: `"http://${API_HOST}:4000"`,
  DEV_ACCOUNTID: `"${DEV_ACCOUNT_ID}"`
}
