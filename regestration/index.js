// const express = require("express");

// console.log("hello world")

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const path = require("path");

const authrouter = require("./router/authrouter")
const notesRouter = require('./router/notesrouter');
const transRouter = require('./router/transrouter');

require("dotenv").config();
const app = express()
//app.use(cors())
app.use(cors({
    origin: 'http://127.0.0.1:5500',  // your frontend
    credentials: true                // allow cookies/session to be sent
  }));
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'", "https://text-translator2.p.rapidapi.com"],
        imgSrc: ["'self'", "data:", "https://ssl.gstatic.com"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  }));
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
app.use('/api/notes', notesRouter);
app.use('/api/trans', transRouter);

// app.use(express.static(path.join(__dirname, "public/cards")))
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