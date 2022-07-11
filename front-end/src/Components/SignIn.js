import {useNavigate} from "react-router-dom"
import { Link } from "react-router-dom"

const SignIn = () => {
    const nav = useNavigate()
    const handleSubmit = (event) => {
        event.preventDefault()
        const {userName, password} = event.target
        console.log(userName.value)
        if(userName.value === process.env.REACT_APP_USERNAME && password.value === process.env.REACT_APP_PASSWORD){
            nav("/player")
        }
    }
    return (
        // <form onSubmit={handleSubmit} action="">
        //     <input id="userName"type="text" required/>
        //     <input id="password"type="text" required/>
        //     <input type="submit" />
        // </form>
        <div>
            <div>
                <Link to="/rooms">Join a room</Link>
            </div> 
            <div>
                <Link to="/player">Join as Player</Link>
            </div>
            
        </div>
    )
}

export default SignIn