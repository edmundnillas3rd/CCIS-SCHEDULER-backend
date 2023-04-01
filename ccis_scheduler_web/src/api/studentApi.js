import axios from "axios"

const BASE_URL = "http/localhost:5000/api/student"
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
    async allTeachers(){
        const result = await axiosApi.get("/all-teachers")
        return result
    }
    async allVenues(){
        const result = await axiosApi.get("/all-venues")
        return result
    }
    async availableMeetingList(){
        const result = await axiosApi.get("/available-meetings")
        return result
    }
    async pendingMeetingList(){
        const result = await axiosApi.get("/pending-meetings/creator")
        return result
    }
    async createdMeetingList(){
        const result = await axiosApi.get("/my-meetings/creator")
        return result
    }
    async joinedMeetingList(){
        const result = await axiosApi.get("/my-meetings/participant")
        return result
    }
    async createdMeetingArchiveList(){
        const result = await axiosApi.get("/my-archive-meetings/creator")
        return result
    }
    async joinedMeetingArchiveList(){
        const result = await axiosApi.get("/my-archive-meetings/participant")
        return result
    }
    async viewCreatedMeeting(code){
        const result = await axiosApi.get(`/${code}/view-meeting/creator`)
        return result
    }
    async viewJoinedMeeting(code){
        const result = await axiosApi.get(`/${code}/view-meeting/participant`)
        return result
    }
    async viewCreatedArchiveMeeting(code){
        const result = await axiosApi.get(`/${code}/view-archive-meeting/creator`)
        return result
    }
    async viewJoinedArchiveMeeting(code){
        const result = await axiosApi.get(`/${code}/view-archive-meeting/participant`)
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
    async confirmCredentials(credentials){
        const result = await axiosApi.post("/confirm-credentials", credentials)
        return result
    }
    async createMeeting(formdata){
        const result = await axiosApi.post("/create-meeting", formdata)
    }
    async joinMeeting(code){
        const result = await axiosApi.post(`/${code}/join`)
        return result
    }
    async verifySignUp(id, verify_token){
        const result = await axiosApi.post(`/verify-signup/${id}/${verify_token}`)
        return result
    }

    //PATCH
    async signout(){
        const result = await axiosApi.patch("/signout")
        return result
    }
    async updateProfile(formdata){
        const result = await axiosApi.patch("/update-profile", formdata)
        return result
    }
    async updateProfilePic(){
        const result = await axiosApi.patch("/update-profile-pic")
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
    async updatePendingMeeting(code, formData){
        const result = await axiosApi.patch(`/${code}/update-pending-meeting`, formData)
        return result
    }
    async archiveMeeting(code){
        const result = await axiosApi.patch(`/${code}/archive-meeting`)
        return result
    }
    async toPrivate(code){
        const result = await axiosApi.patch(`/${code}/to-private`)
        return result
    }
    async toPublic(code){
        const result = await axiosApi.patch(`/${code}/to-public`)
        return result
    }

    //DELETE
    async removeProfilePic(filename){
        const result = await axiosApi.delete(`/${filename}/remove-profile-pic`)
        return result
    }
    async deleteMeeting(code){
        const result = await axiosApi.delete(`/${code}/delete-meeting/creator`)
        return result
    }
    async leaveMeeting(code){
        const result = await axiosApi.delete(`/${code}/leave-meeting/participant`)
        return result
    }

}