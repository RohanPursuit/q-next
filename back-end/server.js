//DEPENDENCIES
const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const ytdl = require("ytdl-core")
const ytsr = require("ytsr")
const {createServer} = require("http")
const {Server} = require("socket.io")

// CONFIGURATION
require("dotenv").config()
const app = express()
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors:{
        origin: []
    }
});

// MIDDLEWARE
app.use(cors())
app.use(express.json())
io.use((socket, next)=> {
    const test = false
    if(test){
        next()
    }else {
        next(new Error("No Access"))
    }
}).on("connection", (socket) => {
    console.log(socket)
})

//ROUTES
app.get("/", (req, res)=> {
    console.log("GET /")
    res.send("Hello World")
})

app.get("*", (req, res)=> {
    console.log("GET anything else")
    res.send("There is nothing here")
})

// LISTEN
const PORT = process.env.PORT
httpServer.listen(PORT, () => {
    console.log(`🔊Listening to music on port ${PORT}🔊`)
})