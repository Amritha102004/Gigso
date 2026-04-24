import app from "./app";
import { ENV } from "./config/env.config";
import { connectDB } from "./config/db";

connectDB().then(() => {
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}...`);
  });
});