import io from "socket.io-client"
import { useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
const {REACT_APP_API_URL: URL} = process.env


function Rooms(){
    const [rooms, setRooms] = useState([])

    const [socket, setSocket] = useState(null)
    
    const startConnect = useCallback(() => {
            const socket = io(URL, {
                query: {
                    id: "rooms",
                }
            })
            setSocket(socket)
            socket.off("connect").on("connect", () => {
                console.log("connected")
                // socket.emit("get-rooms")
            }).on("send-room", (rooms) => {
                console.log(rooms)
                setRooms(rooms)
            })
        }
        )

    const handleRefresh = () =>{
         socket.emit("get-rooms")
    }
    
    useEffect(()=> {
        startConnect()
    }, [])
    return(
        <div>
            <h1>Rooms</h1>
            {rooms.map((room, i) => {
                return (
                    <div key={i}>
                        <Link to={room}>{room}</Link>
                    </div>
                )
            })}
            <button onClick={handleRefresh}>Refresh</button>
        </div>
    )
}

export default Rooms