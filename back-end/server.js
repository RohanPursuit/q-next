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
        origin: [process.env.LOCAL, process.env.LOCALIP, process.env.FRONTEND]
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
        playlist[socket.id] = {current: 0}
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
            socket.emit("get-playlist", {current: 0 , songs: []})
        } else {
            socket.emit("get-playlist", playlist[id])
        }
    })


    socket.on("send-playlist", ({room, songs}) => {
        console.log("send-playlist ", room)
        playlist[room] = {...playlist[room], songs}
        socket.in(room).emit("get-playlist", playlist[room])
    })

    socket.on("play-next", (id) => {
        console.log("Play Next")
        //socket.broadcast.emit("play-next", id) didn't work until i change it to socket.broadcast.emit("next", id)
        if(playlist[id].current >=playlist[id].songs.length-1){
            console.log("Now Playing songs at index zero! ", playlist[id] >= playlist[id].songs.length)
            playlist[id].current = 0
            socket.in(id).emit("next", {id, ...playlist[id]})
        } else {
            console.log("Now Playing New Song!")
            playlist[id].current += 1
            socket.in(id).emit("next", {id, ...playlist[id]})
        }
    })

    socket.on("player-next", (id) => {
        console.log("Play Next")
        if(playlist[id].current >=playlist[id].songs.length-1){
            console.log("Now Playing songs at index zero! ", playlist[id] >= playlist[id].songs.length)
            playlist[id].current = 0
            socket.emit("next", {id, ...playlist[id]})
        } else {
            console.log("Now Playing New Song!")
            playlist[id].current += 1
            socket.emit("next", {id, ...playlist[id]})
        }
    })

    //On Disconnect
    socket.on("disconnect", () => {
        //on disconnect find song for that room and delete
        fs.unlink("./songs/"+socket.id + ".mp4", (async (err) => {
            if(err){
                console.log(err)
            }
        }))
        console.log(`User ${socket.id} disconnected`)
    })
})

//ROUTES
app.get("/:id/:url", async (req, res)=> {
    console.log("GET /")
    const connectedSocket = await io.sockets.allSockets()
    //if client connected stream file
    const {id, url} = req.params
    if(connectedSocket.has(id)){
        console.log("Trying to play??")
        await new Promise(() =>
            ytdl("https://www.youtube.com/watch?v="+url)
            .pipe(fs.createWriteStream("songs/"+ id + '.mp4'))
            .on('finish', ()=> {
                setTimeout(() => {
                    fs.createReadStream("songs/"+ id + ".mp4").pipe(res)

                }, 4000)
            })
            ); 
    }else {
        res.send("Not Connected")
    }
})

app.post("/search", async (req, res) => {
    console.log("Post /search")
    const connectedSocket = await io.sockets.allSockets()
    //if client connected stream file
    if(connectedSocket.has(req.body.id)){
        const {q} = req.body
        const filters1 = await ytsr.getFilters(q);
        const filter1 = filters1.get('Type').get('Video');
        const options = {
            limit: 10,
        }
        const searchResults = (await ytsr(filter1.url, options)).items
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

setInterval( async function(){
    console.log("Trying to delete files.")
    const connectedSocket = await io.sockets.allSockets()
    console.log(connectedSocket)
    fs.readdir("./songs", (err, files) => {
        if (err){
            console.log(err)
            // throw err;
        } 
        
        if(!!files && files.length > 0){
                for (const file of files) {
                if(!connectedSocket.has(file.split(".")[0])){
                    console.log(file.split(".")[0])
                    fs.unlink(path.join("./songs", file), err => {
                        if (err){
                            console.log(err)
                        };
                    });
                }
            }
        }
        
      });
}, 20000)
/**
 * Problems:
 * songs aren't deleted correctly
 */