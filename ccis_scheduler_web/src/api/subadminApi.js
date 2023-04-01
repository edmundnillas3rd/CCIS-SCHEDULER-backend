import axios from "axios"

const BASE_URL = "http/localhost:5000/api/teacher"
const access_token = localStorage.getItem("token")
const email_token = localStorage.getItem("email-token")

const axiosApi = axios.create({
    baseURL: BASE_URL,
    headers: {Authorization: `Bearer ${access_token}`}
})

const emailApi = axios.create({
    baseURL: BASE_URL,
    headers: {Authorization: `Bearer ${email_token}`}
})

export default class Api{
    //GET
    async profile(){
        const result = await axiosApi.get("/profile")
        return result
    }
    async allStudents(){
        const result = await axiosApi.get("/all-students")
        return result
    }
    async allTeachers(){
        const result = await axiosApi.get("/all-teachers")
        return result
    }
    async allVenues(){
        const result = await axiosApi.get("/all-venues")
        return result
    }
    async teamMembers(){
        const result = await axiosApi.get("/team-members")
        return result
    }

    async meetingList(){
        const result = await axiosApi.get("/list-of-meetings")
        return result
    }
    async meetingArchiveList(){
        const result = await axiosApi.get("/list-of-archive-meetings")
        return result
    }

    async viewMeeting(code){
        const result = await axiosApi.get(`${code}/view-meeting`)
        return result
    }
    async viewMeetingArchive(code){
        const result = await axiosApi.get(`${code}/view-archive-meetings`)
        return result
    }
    
    //POST
    async login(formdata){
        const result = await axiosApi.post("/login", formdata)
        return result
    }
    async addTeacher(formdata){
        const result = await axiosApi.post("/add-teacher", formdata)
        return result
    }
    async addVenue(formdata){
        const result = await axiosApi.post("/add-venue", formdata)
        return result
    }

   
    //DELETE
    async removeStudents(id){
        const result = await axiosApi.delete(`/students/${id}`)
        return result
    }
    async removeTeachers(id){
        const result = await axiosApi.delete(`/teacher/${id}`)
        return result
    }
    async removeVenues(id){
        const result = await axiosApi.delete(`/venues/${id}`)
        return result
    }
}