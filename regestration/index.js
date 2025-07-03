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
const chatRouter = require('./router/chatrouter');
const chromeRouter = require('./router/chromerouter');

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
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://ssl.gstatic.com"],
        fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        connectSrc: [
          "'self'",
          "https://text-translator2.p.rapidapi.com",
          "https://www.googleapis.com"
        ],
        frameSrc: ["'self'", "https://calendar.google.com"],
      }
    }
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
app.use('/api/chat', chatRouter);
app.use('/api/chrome', chromeRouter);

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