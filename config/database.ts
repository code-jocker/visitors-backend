import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import config from "./config";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

const sequelizeOptions: any = {
  dialect: (DATABASE_URL ? "postgres" : config.database.dialect) as any,
  logging: false,
  // Render Postgres often requires SSL.
  ...(DATABASE_URL
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
};

// Create Sequelize using DATABASE_URL when available (Render), otherwise fallback to individual vars.
// NOTE: we keep initialization errors actionable in initializeDatabase().
const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, sequelizeOptions)
  : new Sequelize(
      config.database.databaseName,
      config.database.user,
      config.database.password,
      {
        host: config.database.host,
        port: config.database.port,
        dialect: config.database.dialect as any,
        logging: false,
      }
    );


export const initializeDatabase = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    // Validate env when not using DATABASE_URL
    if (!process.env.DATABASE_URL && !config.database.databaseName) {
      throw new Error(
        "DB_NAME is missing. Set DB_NAME=visitors in .env (or export it) OR provide DATABASE_URL for Postgres."
      );
    }

    await sequelize.authenticate();

    // Column type alignment (best-effort; differs per dialect)
    // MySQL: LONGTEXT
    if (!process.env.DATABASE_URL) {
      await sequelize
        .query("ALTER TABLE visitors MODIFY COLUMN profilePhoto LONGTEXT NULL")
        .catch(() => undefined);
      await sequelize
        .query("ALTER TABLE users MODIFY COLUMN face LONGTEXT NULL")
        .catch(() => undefined);
    }

    // In dev/prod, avoid automatic ALTER/DROP which can break when constraints/indexes already exist.
    await sequelize.sync({ alter: false });



    console.info("Connection to the database has been established successfully.");
    return { success: true };
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    return { success: false, error };
  }
};

export default sequelize;
