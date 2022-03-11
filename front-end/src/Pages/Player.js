import io from "socket.io-client"

const {REACT_APP_PORT: PORT, REACT_APP_API_URL: URL} = process.env

const Player = () => {
    const socket = io(URL)
    socket.on("connect", () => {
        console.log("connected")
    })
    return (
        <div className="PlayerPage">
            <h1>Q-NEXT Player</h1>
        </div>
    )
}

export default Player