const express = require("express");
const app = express();
require("dotenv").config();
const dbConfig = require("./config/dbConfig");
const path=require('path')



app.use(express.json());
const userRoute = require("./routes/userRoute");
app.use("/api/user", userRoute);
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/doctor", require("./routes/doctorRoutes"));


app.use(express.static(path.join(__dirname,'./client/build')))
app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})
const port = process.env.PORT || 5000;
// console.log(process.env.OS)
app.listen(port, () => {
  console.log(`Node server started at port  ${port}`);
});
