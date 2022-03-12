import io from "socket.io-client"
import {useState, useEffect, useCallback} from "react"
import axios from "axios"
import QRCode from "react-qr-code"

const {REACT_APP_PORT: PORT, REACT_APP_API_URL: URL} = process.env

const Player = () => {
    const [roomId, setRoomId] = useState("Error: Not in a Room")
    const [playlist, setPlaylist] = useState([])
    const [socket, setSocket] = useState(null)
    
    const startConnect = useCallback(() => {
            const socket = io(URL)
            setSocket(socket)
            socket.off("connect").on("connect", () => {
                console.log("connected")
            }).on("private-message", (message) => {
                setRoomId(message)
                axios.get(URL, {params: {id: message}})
                .then((response) => {
                    const data = response.data
                    console.log(data)
                })
            }).on("get-playlist", (array) => {
                console.log("get-playlist")
                setPlaylist(array)
            })
        }
    )
    



    useEffect(()=> {
        startConnect()
    }, [])
    console.log(playlist)
    return (
        <div className="PlayerPage">
            <h1>Q-NEXT Player</h1>
            <h2>Room: {roomId}</h2>
            <QRCode value={"http://192.168.1.159:3000/rooms/"+roomId} />
            {playlist.length !== 0 && playlist.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        <img src={song.bestThumbnail.url} alt="" />
                        <h2>{song.title}</h2>
                        {/* <button id={i}>Delete</button> */}
                    </div>
                )
            })}
        </div>
    )
}

export default Player