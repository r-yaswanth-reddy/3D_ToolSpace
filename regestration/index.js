// const express = require("express");

// console.log("hello world")

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const path = require("path");

const authrouter = require("./router/authrouter")

require("dotenv").config();
const app = express()
app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// app.use(express.static("public"))

mongoose
    .connect(process.env.MONGO_URI).then(()=>{
        console.log("Database connected")
    }).catch(err => {
        console.log(err);
    });


app.use('/api/auth', require('./router/authrouter'));


app.use(express.static(path.join(__dirname, "public")))

// app.get("", (req, res) => {
//     res.sendFile(__dirname + "/public/signup.html")
// })

app.get("/", (req, res) => {
    res.json({ message: 'Hello from the server'});
})

app.listen(process.env.PORT, () => {
    console.log("listening...")
})