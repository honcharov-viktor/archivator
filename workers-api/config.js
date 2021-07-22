
const Joi = require('joi');

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

  AMQP_URL: Joi.string().required(),
  ARCHIVATOR_QUEUE: Joi.string().default('archivator_tasks'),

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
  amqpUrl: envVars.AMQP_URL,
  queues: {
    archivator: envVars.ARCHIVATOR_QUEUE,
  },
};

console.log('======================== Config ========================');
console.log(config);
console.log('========================================================');

module.exports = config;
