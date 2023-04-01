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
    async signup(formdata){
        const result = await axiosApi.post("/signup", formdata)
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
    async confirmCredentials(credentials){
        const result = await axiosApi.post("/confirm-credentials", credentials)
        return result
    }
    async addSubAdmin(id, email){
        const result = await axiosApi.post(`/${id}/${email}/add-sub-admin`)
        return result
    }

    //PATCH
    async updateProfile(formdata){
        const result = await axiosApi.patch("/update-profile", formdata)
        return result
    }
    async updateUsername(formData){
        const result = await emailApi.patch("/update-username", formData)
        return result
    }
    async updatePassword(formData){
        const result = await emailApi.patch("/update-password", formData)
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
    async removeSubAdmin(id){
        const result = await axiosApi.delete(`/sub-admin/${id}`)
        return result
    }
}