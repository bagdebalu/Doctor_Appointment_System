const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("mangoDb is connected");
});

connection.on("error", (error) => {
  console.log("Error in MongoDb connection", error);
});

module.exports = mongoose;
