import io from "socket.io-client"
import {useState, useEffect, useCallback} from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

const {REACT_APP_API_URL: URL} = process.env

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
            }).on("get-playlist", ({current, songs}) => {
                console.log("get-playlist")
                setPlaylist(songs)
            })
            }, [id]
            )
            
    const handleChange = (event) => {
        setSearch(event.target.value)
    }

    const handleSearch = () => {
        if(search.trim() !== ""){
            axios.post(`${URL}/search`, {
                q: search,
                id, 
            })
            .then((response) => {
                setResults(response.data.payload)
            }) 
        } else {
            alert("Search field can not be")
        }
       
    }

    const handleAddToPlaylist = (song) => {
        console.log(song)
        setPlaylist([...playlist, song])
        setResults([])
        socket.emit("send-playlist", {
            room: id,
            songs: [...playlist, song]
        })
    }

    const handleDelete = (event) => {
        console.log(event.target)
        const arr = playlist.filter((song, i) => Number(event.target.id) !== i)
        setPlaylist(arr)
        socket.emit("send-playlist", {
            room: id,
            songs: arr
        })
    }

    const handlePlayNext = () => {
        socket.emit("play-next", id)
    }

    useEffect(()=> {
        startConnect()
        console.log("useEffect Running")
    }, [startConnect])


    console.log(results)
    return (
        <div className="PlayerPage">
            {/* Stop user input if need to fetch new entry/playlist or fetch updated playlist before added user Request */}
            <div className="search-next">
                <button onClick={handlePlayNext}>Q-NEXT Request</button>
                <h2>Room: {id}</h2>
                <input onChange={handleChange} type="text" placeholder="Input Search"  required/>
                <button onClick={handleSearch}>Search</button>
            </div>
           <section className="request-main">
               {results.length === 0 ? playlist.length !== 0 && playlist.length !== 0 && playlist.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        <div className="video-delete">
                            <img src={song.bestThumbnail.url} alt="" />
                            <button id={i} onClick={handleDelete}>D</button>
                        </div>
                        <h2>{song.title}</h2>
                        <hr />
                    </div>
                )
            }).reverse():
            results.length !== 0 && results.map((song, i) => {
                return (
                    <div key={i} className="video-card-m">
                        <img onClick={() => handleAddToPlaylist(song)} src={song.bestThumbnail.url} alt="" />
                        <h2>{song.title}</h2>
                    </div>
                )
            })}
           </section>
            
        </div>
    )
}

export default Request