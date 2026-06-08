import sequelize from "../config/database";
import "../models/index"; // Import models to register them with sequelize

const syncDatabase = async () => {
    try {
        console.log("Starting database synchronization...");

        // Ensure connection is established
        await sequelize.authenticate();
        console.log("Database connection established.");

        // Run sync with alter: true
        await sequelize.sync({ alter: true });
        console.log("Database synchronized successfully.");

        process.exit(0);
    } catch (error) {
        console.error("Error synchronizing database:", error);
        process.exit(1);
    }
};

syncDatabase();
