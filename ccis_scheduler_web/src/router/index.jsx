
import {
    Route,
    createBrowserRouter,
    createRoutesFromElements
} from "react-router-dom"

// LAYOUT
import MainLayout from "../Layout/MainLayout";
import RequireAuthLayout from "../Layout/RequireAuthLayout";

//PAGES
import Home from "../pages/Home";
import StudentLogin from "../pages/LoginPages/StudentLogin";
import StudentSignup from "../pages/Signup";
import Profile from "../pages/ProfilePages/StudentProfile";
import StudentDashboard, {DataLoader} from "../pages/DashboardPages/StudentDashboard";

import StudentMainComponents from "../components/StudentComponents/Main";
const roles = {
    student: "student",
    teacher: "teacher",
    admin: "admin",
    subadmin: "subadmin"
}

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout/>} >
            <Route index element={<Home/>}/>
            <Route path="student-login" element={<StudentLogin/>}/>
            <Route path="student-signup" element={<StudentSignup/>}/>

                <Route element={<RequireAuthLayout  allowedRoles={roles.student}/>} >
                    <Route path="student/dashboard" element={<StudentDashboard/>} loader={DataLoader}>
                        <Route path="*" element={<StudentMainComponents/>}/>                  
                    </Route> 
                    <Route path="student/profile" element={<Profile/>}>
                        
                    </Route>             
                </Route>



        </Route>
    )
)

export default router;