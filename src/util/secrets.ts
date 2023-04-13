import fs from "fs";
import dotenv from "dotenv";
import { IssuerMetadata } from "openid-client";
import { SSOConnectionInterface } from '../../types/sso-connection';


export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}



export const UPLOAD_METHOD = (() => {

  const method = process.env.UPLOAD_METHOD;
  if (method && ["s3", "google-cloud"].includes(method)) {
    return method;
  }

  return "local";
})();

export const MONGODB_URI =
  process.env.MONGODB_URI ??
  (prod ? "" : "mongodb://root:password@127.0.0.1:27017/");
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

export const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
const isLocalhost = APP_ORIGIN.includes("localhost");

const corsOriginRegex = process.env.CORS_ORIGIN_REGEX;
export const CORS_ORIGIN_REGEX = corsOriginRegex
  ? new RegExp(corsOriginRegex, "i")
  : null;





export const JWT_SECRET = process.env.JWT_SECRET || "dev";
if ((prod || !isLocalhost)  && JWT_SECRET === "dev") {
  throw new Error(
    "Cannot use JWT_SECRET=dev in production. Please set to a long random string."
  );
}

const testConn = process.env.POSTGRES_TEST_CONN;
export const POSTGRES_TEST_CONN = testConn ? JSON.parse(testConn) : {};


export const DEFAULT_CONVERSION_WINDOW_HOURS =
  parseInt(process.env.DEFAULT_CONVERSION_WINDOW_HOURS || "") || 72;

export const QUERY_CACHE_TTL_MINS =
  parseInt(process.env.QUERY_CACHE_TTL_MINS || "") || 60;

// When importing past experiments, limit to this number of days:
export const IMPORT_LIMIT_DAYS =
  parseInt(process.env?.IMPORT_LIMIT_DAYS || "") || 365;

export const CRON_ENABLED = !process.env.CRON_DISABLED;


  // Must include clientId and specific metadata
  const requiredMetadataKeys: (keyof IssuerMetadata)[] = [
    "authorization_endpoint",
    "issuer",
    "jwks_uri",
    "id_token_signing_alg_values_supported",
    "token_endpoint",
  ];

// Self-hosted SSO
function getSSOConfig() {
  if (!process.env.SSO_CONFIG) return null;

  const config: SSOConnectionInterface = JSON.parse(process.env.SSO_CONFIG);
  // Must include clientId and specific metadata
  const requiredMetadataKeys: (keyof IssuerMetadata)[] = [
    "authorization_endpoint",
    "issuer",
    "jwks_uri",
    "id_token_signing_alg_values_supported",
    "token_endpoint",
  ];
  if (!config?.clientId || !config?.metadata) {
    throw new Error("SSO_CONFIG must contain 'clientId' and 'metadata'");
  }

  const missingMetadata = requiredMetadataKeys.filter(
    (k) => !(k in config.metadata)
  );
  if (missingMetadata.length > 0) {
    throw new Error(
      "SSO_CONFIG missing required metadata fields: " +
        missingMetadata.join(", ")
    );
  }
  config.id = "";
  return config;
}
export const SSO_CONFIG = getSSOConfig();



export const VERCEL_CLIENT_ID = process.env.VERCEL_CLIENT_ID || "";
export const VERCEL_CLIENT_SECRET = process.env.VERCEL_CLIENT_SECRET || "";


// Add a default secret access key via an environment variable
// don't allow using "dev" (default value) in prod
let secretAPIKey = process.env.SECRET_API_KEY || "";
if ((prod || !isLocalhost) && secretAPIKey === "dev") {
  secretAPIKey = "";
  // eslint-disable-next-line
  console.error(
    "SECRET_API_KEY must be set to a secure value in production. Disabling access."
  );
}
export const SECRET_API_KEY = secretAPIKey;
export const PROXY_ENABLED = !!process.env.PROXY_ENABLED;
export const PROXY_HOST_INTERNAL = process.env.PROXY_HOST_INTERNAL || "";
export const PROXY_HOST_PUBLIC = process.env.PROXY_HOST_PUBLIC || "";

/**
 * Allows custom configuration of the trust proxy settings as
 * described in the docs: https://expressjs.com/en/5x/api.html#trust.proxy.options.table
 *
 *  All other truthy values will be used verbatim.
 */
const getTrustProxyConfig = (): boolean | string | number => {
  const value = process.env.EXPRESS_TRUST_PROXY_OPTS;

  // If no value set, return false
  if (!value) {
    return false;
  }

  // Lower-cased value to enable easier boolean config
  const lowerCasedValue = value.toLowerCase();
  if (lowerCasedValue === "true") return true;
  if (lowerCasedValue === "false") return false;

  // Check for nth hop config
  //    Trust the nth hop from the front-facing proxy server as the client.
  if (value.match(/^[0-9]+$/)) {
    return parseInt(value);
  }

  // If not a recognized boolean format or a valid integer, return value verbatim
  return value;
};

export const EXPRESS_TRUST_PROXY_OPTS = getTrustProxyConfig();
