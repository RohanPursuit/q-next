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
        origin: [process.env.LOCAL, process.env.LOCALIP]
    }
});

const playlist = {}

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

    socket.on("get-playlist", (id) => {
        console.log("get-playlist ")
        if(!playlist[id]){
            socket.emit("get-playlist", [])
        } else {
            socket.emit("get-playlist", playlist[id])
        }
    })


    socket.on("send-playlist", ({room, songs}) => {
        console.log("send-playlist ", room)
        playlist[room] = songs
        socket.broadcast.emit("get-playlist", playlist[room])
    })

    //On Disconnect
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

app.post("/", async (req, res) => {
    console.log("Post /")
    const connectedSocket = await io.sockets.allSockets()
    //if client connected stream file
    if(connectedSocket.has(req.body.id)){
        res.send("Hello World")

    }else {
        res.send("Not Connected")
    }

})

app.post("/search", async (req, res) => {
    console.log("Post /search")
    const connectedSocket = await io.sockets.allSockets()
    //if client connected stream file
    console.log(req.body)
    if(connectedSocket.has(req.body.id)){
        const {q} = req.body
        // console.log(q)
        // const search = (await ytsr(q, {limit: 10})).items
        // console.log(search)
        // res.status(200).json({success: true, payload: search})
        const filters1 = await ytsr.getFilters(q);
        const filter1 = filters1.get('Type').get('Video');
        const options = {
            limit: 10,
        }
        const searchResults = (await ytsr(filter1.url, options)).items
        // console.log(searchResults)
        res.status(200).json({success: true, payload: searchResults})

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