import io from "socket.io-client"
import {useState, useEffect, useCallback, useRef} from "react"
import axios from "axios"
import QRCode from "react-qr-code"

const {REACT_APP_API_URL: URL} = process.env

const Player = () => {
    const [roomId, setRoomId] = useState("Error: Not in a Room")
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
    const [videoUrl, setVideoUrl] = useState("http://192.168.1.159:3004")
    
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


    useEffect(()=> {
        startConnect()
    }, [setVideoUrl])

    return (
        <div className="PlayerPage">
            <h1>Q-NEXT Player</h1>
            <h2>Room: {roomId}</h2>
            <QRCode value={"http://192.168.1.159:3000/rooms/"+roomId} />
            {songs.length !== 0 && songs.map((song, i) => {
                    return (
                        <div key={i} className="video-card-m">
                            <img src={song.bestThumbnail.url} alt="" />
                            <h2>{song.title}</h2>
                            {/* <button id={i}>Delete</button> */}
                        </div>
                    )
                }).reverse()
            }
            <video onEnded={handleEnded} src={videoUrl} autoPlay muted controls></video>
        </div>
    )
}

export default Player