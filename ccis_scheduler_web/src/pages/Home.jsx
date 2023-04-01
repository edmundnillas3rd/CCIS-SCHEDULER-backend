import {NavLink} from "react-router-dom"
const Home = () => {
   
    return ( 
        <div>
            Homepage PAGE
            <NavLink to="/student-login">Signin</NavLink>
            <NavLink to="/student-signup">Signup</NavLink>

        </div>
     );
}
 
export default Home;