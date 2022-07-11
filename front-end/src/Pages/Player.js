import io from "socket.io-client"
import {useState, useEffect, useCallback} from "react"
import QRCode from "react-qr-code"
import './Player.css'

const {REACT_APP_API_URL: URL} = process.env

const Player = () => {
    const [roomId, setRoomId] = useState("Error: Not in a Room")
    const [code, setCode] = useState("0")
    const [songs, setSongs] = useState([{
            "title": "Short Song (English Song)🎵 [W Lyrics] 30 seconds",
            "id": "M-mtdN6R3bQ",
            "url": "https://www.youtube.com/watch?v=M-mtdN6R3bQ",
            "bestThumbnail": {
                "url": "https://i.ytimg.com/vi/M-mtdN6R3bQ/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCgE8O_4fCJsuoLLmKinxD7ClUyBA",
                "width": 720,
                "height": 404
            }
        },{
            "title": "Usher - U Got It Bad (Official Video)",
            "id": "o3IWTfcks4k",
            "url": "https://www.youtube.com/watch?v=o3IWTfcks4k",
            "bestThumbnail": {
                "url": "https://i.ytimg.com/vi/o3IWTfcks4k/hq720.jpg?sqp=-oaymwEXCNAFEJQDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBvofwoK5OC20MXO2nK5M0t4PWBjw",
                "width": 720,
                "height": 404
            }
        }])

    const [socket, setSocket] = useState(null)
    const [videoUrl, setVideoUrl] = useState(process.env.REACT_APP_API_URL)
    
    const startConnect = useCallback(() => {
            const socket = io(URL)
            setSocket(socket)
            socket.off("connect").on("connect", () => {
                console.log("connected")
            }).on("private-message", (message) => {
                setRoomId(message)
                socket.emit("send-playlist", {
                    room: message,
                    songs: songs
                })
                const defaultSong = songs[0].url.split("v=")[1]
                setVideoUrl(videoUrl+"/"+message+"/"+defaultSong)

            }).on("get-playlist", ({current, songs}) => {
                console.log("get-playlist")
                updateSongs(songs)
            }).on("next", ({current, songs, id})=> {
                console.log("Play Next")
                handleNext(current, songs, id)
            }).on("code", (code) => {
                console.log(code)
                setCode(code)
            })
        }
    )

    const updateSongs = (songs) => {
        setSongs(songs)
    }

    const handleEnded = () => {
        console.log("Video ended")
        console.log(roomId)
        socket.emit("player-next", roomId)
    }


    const handleNext = (current, songs, id) => {
        console.log(current)
        console.log(`${URL}/${id}/${songs[current].id}`)
        setVideoUrl(`${URL}/${id}/${songs[current].id}`)
    }

    //everytime someone joins the player, the players password should change

    useEffect(()=> {
        startConnect()
    }, [setVideoUrl])

    return (
        <div className="PlayerPage">
            <section className="main">
            {/* Q-Next logo hovering over video */}
            <div className="video">
            <video onEnded={handleEnded} src={videoUrl} autoPlay muted controls></video>
            <div className="video-controls">
                <button className="back">Back</button>
                <button className="play">Play</button>
                <button className="next">next</button>
            </div>
            </div>

            <div className="roomInfo">
            <h1>{code}</h1>
            <h2>Room: {roomId}</h2>
            <QRCode className="QRCode" value={process.env.REACT_APP_IP+"/rooms/"+roomId} />
            </div>
            </section>

            <div className="playlist">

            {songs.length !== 0 && songs.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        {/* <div className="image"> */}
                            <img src={song.bestThumbnail.url} alt="" />
                        {/* </div> */}
                            <h4>{song.title}</h4>
                            {/* <button id={i}>Delete</button> */}
                        </div>
                    )
                }).reverse()
            }
            </div>

        </div>
    )
}

export default Player