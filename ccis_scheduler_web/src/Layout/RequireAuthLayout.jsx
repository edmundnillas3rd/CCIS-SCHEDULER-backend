import { useEffect } from "react"
import {useNavigate, Outlet} from "react-router-dom"


const RequireAuth = ({allowedRoles}) => {
    const navigate = useNavigate()

     //const token = localStorage.getItem("token")
    //const roles = localStorage.getItem("roles")
    
    useEffect(()=>{
       //if(token){ 
            // if(allowedRoles !== roles){
            //     navigate("/login", {replace: true})
            // }
        // }else{
        //     navigate("/login", {replace: true})
        // }

        if(allowedRoles !== "student") navigate("/student-login", {replace: true}) //remove this later
    }, [])

    return ( 
        <div>
            <Outlet/>
        </div>
     );
}
 
export default RequireAuth;