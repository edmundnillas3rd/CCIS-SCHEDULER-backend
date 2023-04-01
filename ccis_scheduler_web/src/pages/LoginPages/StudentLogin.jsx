import { useEffect, useState } from "react"
import {useNavigate} from "react-router-dom"

const Login = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })

    useEffect(()=>{
       setTimeout(()=>{
            setIsLoading(false)
       }, 1000)
       
    }, [isLoading])

    const handleSubmit = (e)=>{
        e.preventDefault()
        console.log(formData)
        navigate("/student/dashboard", {replace: true})
    }

    return (
        <div>
            {isLoading ? <div>Loading...</div>  :
            <div>
                <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input 
                        type="text" 
                        id="username"
                        onChange={(e)=>setFormData({...formData, username: e.target.value})}
                />

                <label htmlFor="password">Password</label>
                <input 
                        type="password" 
                        id="password"
                        onChange={(e)=>setFormData({...formData, password: e.target.value})}
                />
                <button>Login</button>
                </form>
            </div>
            }   
        </div>
     );
}
 
export default Login;