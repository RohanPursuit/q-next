import io from "socket.io-client"
import {useState, useEffect, useCallback} from "react"
import axios from "axios"
import QRCode from "react-qr-code"

const {REACT_APP_PORT: PORT, REACT_APP_API_URL: URL} = process.env

const Player = () => {
    const [roomId, setRoomId] = useState("Error: Not in a Room")
    const socket = useCallback(() => io(URL))
    
    const startConnect = useCallback(() => {
            socket().on("connect", () => {
                console.log("connected")
            }).on("private-message", (message) => {
                setRoomId(message)
                axios.get(URL, {params: {id: message}})
                .then((response) => {
                    const data = response.data
                    console.log(data)
                })
            })
        }
    )


    useEffect(()=> {
        startConnect()
    }, [])

    return (
        <div className="PlayerPage">
            <h1>Q-NEXT Player</h1>
            <h2>Room: {roomId}</h2>
            <QRCode value={"http://192.168.1.159:3000/rooms/"+roomId} />
        </div>
    )
}

export default Player