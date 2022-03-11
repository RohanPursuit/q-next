import io from "socket.io-client"
import {useEffect, useCallback} from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

const {REACT_APP_PORT: PORT, REACT_APP_API_URL: URL} = process.env

const Request = () => {
    const {id} = useParams()
    const socket = useCallback(() => io(URL, {
        query: {
            id: id,
        }
    }))
    
    const startConnect = useCallback(() => {
            socket().on("connect", () => {
                console.log("connected")
            }).on("private-message", (message) => {
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
            <h1>Q-NEXT Request</h1>
            <h2>Room: {id}</h2>
        </div>
    )
}

export default Request