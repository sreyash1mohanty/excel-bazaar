const mongoose = require("mongoose");
require('dotenv').config();
const DBconnection = async () => {
    const MONGO_URL = process.env.MONGO_URL;
    if (!MONGO_URL) {
        console.error("MONGO_URL is undefined. Please check your .env file.");
        return;
    }
    try {
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to db");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

module.exports = { DBconnection };
