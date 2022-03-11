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
io.use( async (socket, next)=> {
    const connectTo = socket.handshake.query.id
    const connectedSocket = await io.sockets.allSockets()
    if(!connectTo){
        console.log("Player: " + socket.id + " started a room")
        next()
    }else if(connectedSocket.has(connectTo)){
        console.log(`${socket.id} joined room ${connectTo}`)
        socket.join(connectTo)
        next()
    }else {
        next(new Error("No Access"))
    }
}).on("connection", (socket) => {
    io.to(socket.id).emit("private-message", socket.id)
    socket.on("disconnect", () => {
        //on disconnect find song for that room and delete
        console.log(`User ${socket.id} disconnected`)
    })
})

//ROUTES
app.get("/", async (req, res)=> {
    console.log("GET /")
    const connectedSocket = await io.sockets.allSockets()
    //if client connected stream file
    if(connectedSocket.has(req.query.id)){
        res.send("Hello World")

    }else {
        res.send("Not Connected")
    }
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