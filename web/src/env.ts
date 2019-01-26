const environment = process.env.REACT_APP_ENV

export const backendBase = environment === 'dev'
  ? process.env.REACT_APP_API_BASE_DEV
  : process.env.REACT_APP_API_BASE_PROD
