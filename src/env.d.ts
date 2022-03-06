declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;

    REDIS_DB: number;
    REDIS_PORT: number;
    REDIS_HOST: string;
    REDIS_PASSWORD: string;

    HODA_BASE_URL: string;
    HODA_WS_PASSWORD: string;
    HODA_SP_REST_ID: string;
    HODA_SERVICE_ID: string;
    HODA_URL_START_AUTH: string;
    HODA_URL_AUTH_GATEWAY: string;
    HODA_URL_GSB_GET_DATA: string;
  }
}
