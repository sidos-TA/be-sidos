const fs = require("fs");

module.exports = {
  development: {
    username: process.env.DEV_DB_USERNAME,
    password: null,
    database: process.env.DEV_DB_NAME,
    host: process.env.DEV_DB_HOSTNAME,
    dialect: "mysql",
    dialectOptions: {
      bigNumberStrings: true,
    },
  },

  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    dialect: "mysql",
    dialectOptions: {
      bigNumberStrings: true,
      //   ssl: {
      //     ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt')
      //   }
    },
  },
};
