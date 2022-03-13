import {useNavigate} from "react-router-dom"

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
        <form onSubmit={handleSubmit} action="">
            <input id="userName"type="text" required/>
            <input id="password"type="text" required/>
            <input type="submit" />
        </form>
    )
}

export default SignIn