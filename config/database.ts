import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./config";
dotenv.config();

const requiredEnv = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  databaseName: config.database.databaseName,
};

// Hard fail with actionable logging so env issues are obvious.
if (!requiredEnv.databaseName) {
  console.error(
    "❌ Database configuration error: DB_NAME is missing. " +
      "Set DB_NAME=visitors in your .env (or export it in your environment)."
  );
}


const sequelizeOptions: any = {
  host: requiredEnv.host,
  port: requiredEnv.port,
  dialect: config.database.dialect,
  logging: false,
};

// Create Sequelize using .env-backed config.
// NOTE: if DB_NAME is missing, the app will still start but DB initialization will fail with clearer logs.
const sequelize = new Sequelize(
  requiredEnv.databaseName,
  requiredEnv.user,
  requiredEnv.password,
  sequelizeOptions
);

export const initializeDatabase = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    if (!config.database.databaseName) {
      throw new Error(
        "DB_NAME is missing. Please set DB_NAME=visitors in .env so Sequelize connects to the correct database."
      );
    }

    await sequelize.authenticate();
    await sequelize.query("ALTER TABLE visitors MODIFY COLUMN profilePhoto LONGTEXT NULL").catch(() => undefined);
    await sequelize.query("ALTER TABLE users MODIFY COLUMN face LONGTEXT NULL").catch(() => undefined);

    // In dev, avoid automatic ALTER/DROP which can break when constraints/indexes already exist.
    await sequelize.sync({ alter: false });



    console.info("Connection to the database has been established successfully.");
    return { success: true };
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return { success: false, error };
  }
};

export default sequelize;
