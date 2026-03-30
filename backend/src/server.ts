import mongoose from "mongoose";
import app from "./app";

mongoose.connect(process.env.MONGO_URI!)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Server running...");
        });
    });