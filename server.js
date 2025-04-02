const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTIOIN! Shitting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: "./config.env" });

const uri = `${process.env.DATABASE}`.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(uri).then(() => {
  console.log("DB connected successfully!");
});

const app = require("./app");

const PORT = process.env.PORT || 3500;
const server = app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shitting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
