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
    async allVenues(){
        const result = await axiosApi.get("/all-venues")
        return result
    }
    async searchMeeting(code){
        const result = await axiosApi.get("/seacrh-meetings", code)
        return result
    }

    async myMeetings(){
        const result = await axiosApi.get("/my-meetings")
        return result
    }

    async archiveMeetings(){
        const result = await axiosApi.get("/archive-meetings")
        return result
    }
  
    async viewMeeting(code){
        const result = await axiosApi.get(`/${code}/view-meeting`)
        return result
    }
  
    async viewArchiveMeeting(code){
        const result = await axiosApi.get(`/${code}/view-archive-meeting`)
        return result
    }
   

    //POST
    async login(formData){
        const result = await axiosApi.post("/login", formData)
        return result
    }
    async confirmCredentials(credentials){
        const result = await axiosApi.post("/confirm-credentials", credentials)
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

    async joinMeeting(code){
        const result = await axiosApi.patch(`/${code}/join-meeting`)
        return result
    }
    async postponedMeeting(code){
        const result = await axiosApi.patch(`/${code}/postponed-meeting`)
        return result
    }
    async limitParticipant(code){
        const result = await axiosApi.patch(`/${code}/limit-number-participants`)
        return result
    }
//DELETE
async removeProfilePic(filename){
    const result = await axiosApi.delete(`/${filename}/remove-profile-pic`)
    return result
}
    
}
