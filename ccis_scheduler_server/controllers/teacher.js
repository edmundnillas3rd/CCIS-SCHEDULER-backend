const db = require("../config/db")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const ExpressError = require("../utils/ExpressError")
const {cloudinary} = require("../services/cloudinary")
const transporter = require("../services/transporter")
dotenv.config();


//Get

const teacherProfile = async(req, res, next)=>{
    const id = req.user;
    try{
       
        let sql = `select * from teachers where teacher_id = ?`
        const [result] = await db.query(sql, [id]);
        if(!result.length){
            next(new ExpressError(404, "No Profile Found"))
        }else{
            res.status(200).json({
                id: result[0]?.teacher_id,
                image: JSON.parse(result[0]?.teacher_image),
                fullname: result[0]?.teachers_fullname,
                email: result[0]?.teachers_email,
                active_status: result[0]?.isActive,
            })
            
        }
    }catch(error){
        next(error)
    }
}

const allStudent= async(req, res, next)=>{
    const id = req.user;
    try{
        let sql = `select * from students order by _year desc`
        const [result] = await db.query(sql, [id]);
        if(!result.length){
            next(new ExpressError(404, "No Student Available"))
        }else{
            let jsonObject = {}
            const key = "student"
            jsonObject[key] = []

            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.student_id,
                    image: JSON.parse(result[i]?.student_image),
                    fullname: result[i]?.students_fullname,
                    course: result[i]?._course,
                    year: result[i]?._year,
                    email: result[i]?.students_email,
                    active_status: result[i]?.isActive
                }
                jsonObject[key].push(details)
            }
            res.status(200).json({jsonObject})   
            
        }
    }catch(error){
        next(error)
    }
}
const allVenues = async(req, res, next)=>{
    try{
        let sql = `select * from venues`;
        const [result] = await db.query(sql); 
        if(!result.length){
            next(new ExpressError(404, "No Venue Found"))
        }else{
            let jsonObject = {}
            const key = "venues"
            jsonObject[key] = []
            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.venue_id,
                    area: result[i]?.area,
                    room: result[i]?.room
                }
                jsonObject[key].push(details)
            }
            res.status(200).json(jsonObject)    
        }
    }catch(error){
        next(error)
    }
}

const seachMeetingCode = async(req, res, next)=>{
    try{
        const {code} = req.body;
        let sql = `select * from meetings
        inner join venues
        on venues_id = venue_id
        where meeting_code = ? and isArchive = 0`
        const [result] = await db.query(sql, [code])
        if(!result.length){
            next(new ExpressError(404, "Invalid Meeting Code or Meeting Does Not Exist"))
        }else{
            const meetingDetails = {
                id: result[0]?.meeting_id,
                title: result[0]?.meeting_title,
                description: result[0]?.meeting_description,
                code: result[0]?.meeting_code,
                date: result[0]?.meeting_date,
                day: result[0]?.meeting_day,
                time: {
                    start: result[0]?.time_start,
                    end: result[0]?.time_end
                },
                venue: {
                    id: result[0]?.venue_id,
                    area: result[0]?.area,
                    room: result[0]?.room
                },
                views: result[0]?.views,
        }
        res.status(200).json({meetingDetails})
    }
    }catch(error){
        next(error)
    }
}
const teacherMyMeetings = async(req, res, next)=>{
    const id = req.user;
    try{
        let sql = `select * from meetings 
        inner join venues
        on venues_id = venue_id
        where teachers_id = ? and isArchive = 0`

        const [result] = await db.query(sql, [id]);
        if(!result.length){
           next(new ExpressError(404, "No Available Meetings That You Created"))
        }else{
            let jsonObject = {}
            const key = "meetings"
            jsonObject[key] = []
            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.meeting_id,
                    code: result[i]?.meeting_code,
                    title: result[i]?.meeting_title,
                    description: result[i]?.meeting_description,
                    date: result[i]?.meeting_date,
                    day: result[i]?.meeting_day,
                    time: {
                        start: result[i]?.time_start,
                        end: result[i]?.time_end
                    },
                    venue: {
                        id: result[i]?.venue_id,
                        area: result[i]?.area,
                        room: result[i]?.room
                    },
                    views: result[i]?.views,
                    postponed: result[i]?.postponed,
                    reason: result[i]?.postponed_reason
                }
                jsonObject[key].push(details)
            }
            res.status(200).json(jsonObject)  
        }
    }catch(error){
        next(error)
    }
}

const teacherViewMeeting = async(req, res, next)=>{
    const id = req.user;
    const {code} = req.params;
    try{
        let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                    teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                    inner join students
                    on student_creator_id = students.student_id
                    inner join teachers
                    on teacher_id = teachers.teacher_id
                    inner join venues
                    on venues_id = venues.venue_id
                    where meeting_code = ? and isArchive = 0
                    union 
                    select null as meeting_id, null as meeting_code, null as meeting_date, null as meeting_day, null as time_start, null as time_end, 
                    null as area, null as room, null as views, null as postponed, null as postponed_reason,null as teacher_image, null as teachers_fullname,  student_id, student_image, students_fullname, _course, _year from participants
                    inner join students
                    on students_id = students.student_id
                    inner join meetings
                    on access_code = meeting_code
                    where access_code = ? and isArchive = 0
                    `

        const [result] = await db.query(sql, [code, code]);

        if(!result.length){
            next(new ExpressError(404, "No Content Available, Please Contact Support"))
         }else{
            let studentObject = {}
            const key = "students"
            studentObject[key] = []

            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.student_id,
                    image: JSON.parse(result[i]?.student_image),
                    fullname: result[i]?.students_fullname,
                    course: result[i]?._course,
                    year: result[i]?._year
                }
                studentObject[key].push(details)
            }
            const meetingDetails = {
                id: result[0]?.meeting_id,
                title: result[0]?.meeting_title,
                description: result[0]?.meeting_description,
                code: result[0]?.meeting_code,
                date: result[0]?.meeting_date,
                day: result[0]?.meeting_day,
                time: {
                    start: result[0]?.time_start,
                    end: result[0]?.time_end
                },
                venue: {
                    area: result[0]?.area,
                    room: result[0]?.room
                },
                teacher: {
                    image: JSON.parse(result[0]?.teacher_image),
                    fullname: result[0]?.teachers_fullname 
                },
                studentObject,
                views: result[0]?.views,
                postponed: result[0]?.postponed,
                reason: result[0]?.postponed_reason
            }
            res.status(200).json({meetingDetails})
         } 
    }catch(error){
        next(error)
    }      
    
}

//archive
const teacherArchiveMeetings = async(req, res, next)=>{
    const id = req.user;
    try{
        let sql = `select * from meetings
        inner join venues
        on venues_id = venue_id
        where teachers_id = ? and isArchive = 1`

        const [result] = await db.query(sql, [id]);
        if(!result.length){
           next(new ExpressError(404, "No Available Archive Meetings"))
        }else{
            let jsonObject = {}
            const key = "meetings"
            jsonObject[key] = []
            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.meeting_id,
                    code: result[i]?.meeting_code,
                    title: result[i]?.meeting_title,
                    description: result[i]?.meeting_description,
                    date: result[i]?.meeting_date,
                    day: result[i]?.meeting_day,
                    time: {
                        start: result[i]?.time_start,
                        end: result[i]?.time_end
                    },
                    venue: {
                        id: result[i]?.venue_id,
                        area: result[i]?.area,
                        room: result[i]?.room
                    },
                    views: result[i]?.views,
                    postponed: result[i]?.postponed,
                    reason: result[i]?.postponed_reason
                }
                jsonObject[key].push(details)
            }
            res.status(200).json(jsonObject)  
        }
    }catch(error){
        next(error)
    }
}

const teacherViewArchiveMeeting = async(req, res, next)=>{
    const id = req.user;
    const {code} = req.params;
    try{
        let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                    teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                    inner join students
                    on student_creator_id = students.student_id
                    inner join teachers
                    on teacher_id = teachers.teacher_id
                    inner join venues
                    on venues_id = venues.venue_id
                    where meeting_code = ? and isArchive = 1
                    union 
                    select null as meeting_id, null as meeting_code, null as meeting_date, null as meeting_day, null as time_start, null as time_end, 
                    null as area, null as room, null as views, null as postponed, null as postponed_reason, null as teacher_image, null as teachers_fullname,  student_id, student_image, students_fullname, _course, _year from participants
                    inner join students
                    on students_id = students.student_id
                    inner join meetings
                    on access_code = meeting_code
                    where access_code = ? and isArchive = 1
                    `

        const [result] = await db.query(sql, [code, code]);

        if(!result.length){
            next(new ExpressError(404, "No Content Available, Please Contact Support"))
         }else{
            let studentObject = {}
            const key = "students"
            studentObject[key] = []

            for(let i = 0; i < result.length; i++){
                let details = {
                    id: result[i]?.student_id,
                    image: JSON.parse(result[i]?.student_image),
                    fullname: result[i]?.students_fullname,
                    course: result[i]?._course,
                    year: result[i]?._year
                }
                studentObject[key].push(details)
            }
            const meetingDetails = {
                id: result[0]?.meeting_id,
                title: result[0]?.meeting_title,
                description: result[0]?.meeting_description,
                code: result[0]?.meeting_code,
                date: result[0]?.meeting_date,
                day: result[0]?.meeting_day,
                time: {
                    start: result[0]?.time_start,
                    end: result[0]?.time_end
                },
                venue: {
                    area: result[0]?.area,
                    room: result[0]?.room
                },
                teacher: {
                    image: JSON.parse(result[0]?.teacher_image),
                    fullname: result[0]?.teachers_fullname
                },
                studentObject,
                views: result[0]?.views,
                postponed: result[0]?.postponed,
                reason: result[0]?.postponed_reason
            }
            res.status(200).json({meetingDetails})
         } 
    }catch(error){
        next(error)
    }      
    
}


//POST

const login = async(req, res, next)=>{

    try{
        const {username, password} = req.body;
        let sql = `select * from teachers where teachers_username = ?`
        const [result] = await db.query(sql, [username])
        if(!result.length){
            next(new ExpressError(400, "Invalid Username and Password"))
        }else{
            const pass = await bcrypt.compare(password, result[0]?.teachers_password)
            if(!pass){
                next(new ExpressError(400, "Invalid Username and Password"))
            }else{
                const token = jwt.sign({id: result[0]?.teacher_id}, process.env.ACCESS_TOKEN);
                res.header(token)
                res.status(200).json(
                    {success_message: "You successfully Login", teacher:{
                        id: result[0]?.teacher_id,
                        role: "teacher",
                        token: token
                    }})
                let updateStatus = `update teachers set isActive = 1`   
                await db.query(`set sql_safe_updates = 0`)
                await db.query(updateStatus)
                await db.query(`set sql_safe_updates = 1`)
            }
            }
   }catch(error){
     next(error)
   }
}

const confirmCredentials = async(req, res, next)=>{
    try{
        const id = req.user;
        const {email} = req.body;
        
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const emailCodeToken = jwt.sign({id: id, code: code}, process.env.EMAIL_CODE_TOKEN, {expiresIn: '6m'})
        res.header(emailCodeToken)

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Verification Code',
            html: `This verification code will expires within 6 minutes
                <br> 
                verification code: ${code}`
        })
        res.status(200).json({email_token: emailCodeToken})
    }catch(error){
        next(error)
    }
}


//Patch


const updateStatusIfSignOut = async(req, res, next)=>{
    try{
        const id = req.user;
        let sql = `update teachers set isActive = 0 where teacher_id = ?`   
        await db.query(`set sql_safe_updates = 0`)
        await db.query(sql, [id])
        await db.query(`set sql_safe_updates = 1`)
        res.status(200).json({success_message: "You Have Sign Out"})
    }catch(error){
        next(error)
    }
}
const joinMeeting = async(req, res, next)=>{
    try{
        const id = req.user;
        const {code} = req.params
        
        let sqlexist = `select * from meetings where meeting_code = ? and teachers_id = ?`
        const [exist] = await db.query(sqlexist, [code, id])
        
        if(exist.length){
            next(new ExpressError(400, "You Already Join The Meeting"))
        }else{
            let sql = `update meetings set teachers_id = ? where meeting_code = ?`
            await db.query(`set sql_safe_updates = 0`)
            const [result] = await db.query(sql, [id,code])
            await db.query(`set sql_safe_updates = 1`)
            if(result.affectedRows === 0){
                next(new ExpressError(400, "Invalid Meeting Code"))
            }else{
            res.status(200).json({success_message: "You Succesfully Join The Meeting"})
            }
        }
}catch(error){
    next(error)
}
}
const updateProfile = async(req, res, next)=>{
    try{
        const id = req.user;
        const {fullname, email} = req.body;
        
        let sql = `update teachers set   
                        teachers_fullname = ?,
                        teachers_email = ?
                    where teacher_id = ?`
        await db.query(`set sql_safe_updates = 0`)
        const [result] =  await db.query(sql, [fullname, email, id])
        await db.query(`set sql_safe_updates = 1`)
        
        if(result.affectedRows === 0){
            next(new ExpressError(404, "Profile Already Been Updated"))
         }else{
                res.status(200).json({success_message: "Profile Has Been Updated"})     
        }

    }catch(error){
        next(error)
    }
}

const updateProfilePic = async(req, res, next)=>{
    try{
        const id = req.user;
        const {filename} = req.body;
        const image = {url: req.file.path, filename: req.file.filename}
        const imageStringify = JSON.stringify(image)

        let sql = `update teachers set teacher_image = ? where teacher_id = ?`   
        await db.query(`set sql_safe_updates = 0`)
        const [result] = await db.query(sql, [imageStringify, id])
        await db.query(`set sql_safe_updates = 1`)

        if(result.affectedRows === 0){
            next(new ExpressError(404, "Profile Picture Already Been Updated"))
         }else{
            if(filename){
                await cloudinary.uploader.destroy(filename)    
            }
            res.status(200).json({success_message: "Profile Picture Has Been Change"})
        }
    }catch(error){
        next(error)
    }
}

const updateUsername = async(req, res, next)=>{
    try{
        const {id, _code} = req.user;
        const {username, code} = req.body;
        if(_code !== code){
            next(new ExpressError(401, "Invalid Verification Code"))
        }else{
            let sql = `update teachers set   
                        teachers_username = ?
                        where teacher_id = ?`

            await db.query(`set sql_safe_updates = 0`)
            await db.query(sql, [username, id])
            await db.query(`set sql_safe_updates = 1`)

            res.status(200).json({success_message: "Username Succesfully Updated"})
        }
    }catch(error){
        next(error)
    }
}


const updatePassword = async(req, res, next)=>{
    try{
        const {id, _code} = req.user;
        const {password, code} = req.body;
        if(_code !== code){
            next(new ExpressError(401, "Invalid Verification Code"))
        }else{
            let sql = `update teachers set   
                        teachers_password = ?
                        where teacher_id = ?`

           const hashedPassword = await bcrypt.hash(password, 10); 
            await db.query(`set sql_safe_updates = 0`)
            await db.query(sql, [hashedPassword, id])
            await db.query(`set sql_safe_updates = 1`)

            res.status(200).json({success_message: "Password Succesfully Update"})
        }
    }catch(error){
        next(error)
    }
}
const postponedMeeting = async(req, res, next)=>{
    try{
        const id = req.user
        const {code} = req.params;
        const {date, day, start, end, venue_id, postponed_reason} = req.body;

        let sql = `update meetings set 
                        meeting_date = ?,
                        meeting_day = ?,
                        time_start = ?,
                        time_end = ?,
                        venues_id = ?,
                        postponed = 1,
                        postponed_reason = ?
                    where teachers_id = ? and meeting_code = ?`
        await db.query(`set sql_safe_updates = 0`)        
        await db.query(sql, [ date, day, start, end, venue_id, postponed_reason, id, code])
        await db.query(`set sql_safe_updates = 1`)
        res.status(200).json({success_message: "Meeting Details has been updated"})
    }catch(error){
        next(error)
    }
}

const limitParticipants = async(req, res, next)=> {
    const id = req.user;
    const {code} = req.params;
    const {num_participants} = req.body;

    let sql = `update meetings set 
                number_participants = ?
                where teachers_id = ? and meeting_code = ?`

    
    await db.query(`set sql_safe_updates = 0`)        
    const [result]= await db.query(sql, [num_participants, id, code])
    console.log(result)
    await db.query(`set sql_safe_updates = 1`)
    res.status(200).json({success_message: "Meeting Details has been updated"})
}

//DELETE

const removeProfilePic = async(req, res, next)=>{
    try{
        const id = req.user;
        const {filename} = req.params;

        let sql = `update teachers set teacher_image = null where teacher_id = ?`   
        await db.query(`set sql_safe_updates = 0`)
        const [result] = await db.query(sql, [id])
        await db.query(`set sql_safe_updates = 1`)

       if(result.affectedRows === 0){
            next(new ExpressError(404, "Profile Picture Already Been Remove"))
         }else{
            if(filename){
                await cloudinary.uploader.destroy(filename)
            }
            res.status(200).json({success_message: "Profile Picture Is Back To Default"})
        }
    }catch(error){
        next(error)
    }
}

// const leaveMeetingTeacher = async(req, res)=>{
//     try{
//         const id = req.user;
//         const {code} = req.params;
//         let sql = `update meetings set teachers_id = null where teachers_id = ? and meeting_code = ?`
//         await db.query(sql, [id, code])
//         res.status(200).json({success_message: "You Leave The Meeting"})
//     }catch(error){
//         next(error)
//     }
// }


//000
module.exports = {
    //GET
    teacherProfile,
    allStudent,
    allVenues,
    seachMeetingCode,
    teacherMyMeetings,
    teacherViewMeeting,
    teacherArchiveMeetings,
    teacherViewArchiveMeeting,
    //POST
    seachMeetingCode,
    login,
    confirmCredentials,
    //PATCH
    joinMeeting,
    updateStatusIfSignOut,
    updateProfile,
    updateProfilePic,
    updateUsername,
    updatePassword,
    postponedMeeting,
    limitParticipants,
    //DELETE
    removeProfilePic,
    //leaveMeetingTeacher
}