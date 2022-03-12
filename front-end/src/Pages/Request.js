import io from "socket.io-client"
import {useState, useEffect, useCallback} from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

const {REACT_APP_PORT: PORT, REACT_APP_API_URL: URL} = process.env

const Request = () => {
    const {id} = useParams()

    const [search, setSearch] = useState(null)
    const [results, setResults] = useState([])
    const [playlist, setPlaylist] = useState([])
    const [socket, setSocket] = useState(null)
    // const [clientId, setClientId] = useState(null)
    
    const startConnect = useCallback(() => {
            const socket = io(URL, {
                    query: {
                        id: id,
                    }
                })
            setSocket(socket)
            socket.on("connect", () => {
                console.log("connected")
            }).on("private-message", (message) => {
                // setClientId(message)
                socket.emit("get-playlist", id)
            }).on("get-playlist", (array) => {
                console.log("get-playlist")
                setPlaylist(array)
            })
            }, []
            )
            
    const handleChange = (event) => {
        setSearch(event.target.value)
    }

    const handleSearch = () => {
        axios.post(`${URL}/search`, {
            q: search,
            id, 
        })
        .then((response) => {
            setResults(response.data.payload)
        })
    }

    const handleAddToPlaylist = (song) => {
        console.log(song)
        setPlaylist([song, ...playlist])
        setResults([])
        socket.emit("send-playlist", {
            room: id,
            songs: [song, ...playlist]
        })
    }

    const handleDelete = (event) => {
        setPlaylist(playlist.filter((song, i) => Number(event.target.id) !== i))
    }

    useEffect(()=> {
        startConnect()
        console.log("useEffect Running")
    }, [startConnect])


    console.log(results)
    return (
        <div className="PlayerPage">
            {/* Stop user input if need to fetch new entry/playlist or fetch updated playlist before added user Request */}
            <h1>Q-NEXT Request</h1>
            <h2>Room: {id}</h2>
            <input onChange={handleChange} type="text"  required/>
            <button onClick={handleSearch}>Search</button>
            {results.length === 0 ? playlist.length !== 0 && playlist.length !== 0 && playlist.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        <img src={song.bestThumbnail.url} alt="" />
                        <h2>{song.title}</h2>
                        <button id={i} onClick={handleDelete}>Delete</button>
                    </div>
                )
            }):
            results.length !== 0 && results.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        <img onClick={() => handleAddToPlaylist(song)} src={song.bestThumbnail.url} alt="" />
                        <h2>{song.title}</h2>
                    </div>
                )
            })}
        </div>
    )
}

export default Request