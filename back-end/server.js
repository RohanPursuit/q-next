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
        origin: [process.env.LOCAL]
    }
});

// MIDDLEWARE
app.use(cors())
app.use(express.json())
io.use((socket, next)=> {
    const test = true
    if(test){
        next()
    }else {
        next(new Error("No Access"))
    }
}).on("connection", (socket) => {
    console.log(socket.id)
    io.to(socket.id).emit("private-message", socket.id)
    socket.on("disconnect", () => {
        console.log(`User ${socket.id} disconnected`)
    })
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