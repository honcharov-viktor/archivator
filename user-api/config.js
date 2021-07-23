
const Joi = require('joi');
const url = require('url');

const allowedEnvironments = [
  'development',
  'staging',
  'production',
];

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string().allow(allowedEnvironments).default('development'),
  PORT: Joi.number().default(8080),

  MONGODB_HOST: Joi.string().required(),
  MONGODB_NAME: Joi.string().required(),
  MONGODB_USER: Joi.string().required(),
  MONGODB_PASS: Joi.string().required(),

  MONGODB_OPTIONS_USE_MONGO_CLIENT: Joi.boolean().default(true),
  MONGODB_OPTIONS_AUTOINDEX: Joi.boolean().default(false),

  MONGOOSE_DEBUG: Joi.boolean().default(false),

  S3_ENDPOINT: Joi.string().required(),
  S3_PORT: Joi.string().default(9091),
  S3_SECURE: Joi.boolean().default(true),
  S3_ACCESS_KEY: Joi.string().required(),
  S3_SECRET_KEY: Joi.string().required(),
  S3_USER_FILES_BUCKET: Joi.string().default('user-files'),

}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  mongodbUrl: `mongodb://${envVars.MONGODB_HOST}/${envVars.MONGODB_NAME}`,
  mongodbOptions: {
    autoIndex: envVars.MONGODB_OPTIONS_AUTOINDEX,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  s3: {
    endpoint: url.format({
      hostname: envVars.S3_ENDPOINT,
      port: envVars.S3_PORT,
      protocol: envVars.S3_SECURE ? 'https:' : 'http:',
    }),
    accessKey: envVars.S3_ACCESS_KEY,
    secretKey: envVars.S3_SECRET_KEY,
    userFilesBucket: envVars.S3_USER_FILES_BUCKET,
  },
};

console.log('======================== Config ========================');
console.log(config);
console.log('========================================================');

module.exports = config;
