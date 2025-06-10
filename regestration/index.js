// const express = require("express");

// console.log("hello world")

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")

const authrouter = require("./router/authrouter")

require("dotenv").config();
const app = express()
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

mongoose
    .connect(process.env.MONGO_URI).then(()=>{
        console.log("Database connected")
    }).catch(err => {
        console.log(err);
    });


app.use("/api/auth", authrouter)



app.get("/", (req, res) => {
    res.json({ message: 'Hello from the server'});
})

app.listen(process.env.PORT, () => {
    console.log("listening...")
})