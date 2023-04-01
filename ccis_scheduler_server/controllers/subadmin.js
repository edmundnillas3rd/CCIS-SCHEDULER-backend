const db = require("../config/db")
const {v4: uuidv4} = require("uuid")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const ExpressError = require("../utils/ExpressError")
const transporter = require("../services/transporter")
require("dotenv").config()

//Get

const subAdminProfile = async(req, res, next)=>{
    const id = req.user;
    try{
       
        let sql = `select * from students where student_id = ? and subAdmin_Privileges = 1`
        const [result] = await db.query(sql, [id]);
        if(!result.length){
            next(new ExpressError(404, "No Profile Found"))
        }else{
            res.status(200).json({
                id: result[0]?.student_id,
                image: JSON.parse(result[0]?.student_image),
                fullname: result[0]?.students_fullname,
                email: result[0]?.students_email,
                active_status: result[0]?.isActive
            })
            
        }
    }catch(error){
        next(error)
    }
}

const allStudent = async(req, res, next)=>{
    try{
        let sql = `select * from students`
        const [result] = await db.query(sql);
        if(!result.length){
            next(new ExpressError(404, "No Students Available"))
        }else{
        let studentObject = {}
        const key = "students"
        studentObject[key] = []

        for(let i = 0; i < result.length; i++){
            let details = {
                id: result[i]?.student_id,
                image: JSON.parse(result[i]?.student_image),
                fullname: result[i]?.students_fullname,
                email: result[i]?.students_email,
                course: result[i]?._course,
                year: result[i]?._year,
                sub_admin: result[i]?.subAdmin_Privilieges
            }
            studentObject[key].push(details)
        }
        res.status(200).json({studentObject})
    }
    }catch(error){
        next(error)
    }
}

const allTeacher = async(req, res, next)=>{
    try{
        let sql = `select * from teachers`;
        const [result] = await db.query(sql);
        if(!result.length){
            next(new ExpressError(404, "No Teachers Available"))
        }else{
        let teacherObject = {}
        const key = "teachers"
        teacherObject[key] = []

        for(let i = 0; i < result.length; i++){
            let details = {
                id: result[i]?.teacher_id,
                image: JSON.parse(result[i]?.teacher_image),
                fullname: result[i]?.teachers_fullname,
                email: result[i]?.teachers_email
            }
            teacherObject[key].push(details)
        }
        res.status(200).json({teacherObject})
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
            next(new ExpressError(404, "No Venues Available"))
        }else{
        let venueObject = {}
        const key = "venues"
        venueObject[key] = []

        for(let i = 0; i < result.length; i++){
            let details = {
                id: result[i]?.venue_id,
                area: result[i]?.area,
                room: result[i]?.room
            }
            venueObject[key].push(details)
        }
        res.status(200).json({venueObject})
    }
    }catch(error){
        next(error)
    }
}

const listOfMeeting = async(req, res, next)=>{
    try{
        let sql = `select * from meetings
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id
                    where isArchive = 0`

        const [result] = await db.query(sql);
        if(!result.length){
           next(new ExpressError(404, "No Available Meetings"))
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
                    teacher: {
                        image: JSON.parse(result[i]?.teacher_image),
                        fullname: result[i]?.teachers_fullname,
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

const listOfArchiveMeeting = async(req, res, next)=>{
    try{
        let sql = `select * from meetings
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id
                    where isArchive = 1`

        const [result] = await db.query(sql);
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
                    teacher: {
                        image: JSON.parse(result[i]?.teacher_image),
                        fullname: result[i]?.teachers_fullname,
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


const subAdminViewMeeting = async(req, res, next)=>{
    
    try{
        const {code} = req.params;
        let sql = `select meeting_id,meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
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
                    null as area, null as room, null as views, null as postponed, null as postponed_reason, null as teacher_image, null as teachers_fullname, student_id, student_image, students_fullname, _course, _year from participants
                    inner join students
                    on students_id = students.student_id
                    inner join meetings
                    on access_code = meeting_code
                    where access_code = ? and isArchive = 0
                    `

        const [result] = await db.query(sql, [code, code]);

        if(!result.length){
            next(new ExpressError(404, "No Content Available"))
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
                    year: result[i]?._year,
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
                    fullname: result[0]?.teachers_fullname,
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
const subAdminViewArchiveMeeting = async(req, res, next)=>{
   
    try{
        const {code} = req.params;
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
                    null as area, null as room, null as views, null as postponed, null as postponed_reason, null as teacher_image, null as teachers_fullname, student_id, student_image, students_fullname, _course, _year from participants
                    inner join students
                    on students_id = students.student_id
                    inner join meetings
                    on access_code = meeting_code
                    where access_code = ? and isArchive = 1
                    `

        const [result] = await db.query(sql, [code, code]);

        if(!result.length){
            next(new ExpressError(404, "No Content Available"))
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
                    fullname: result[0]?.teachers_fullname,
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

const teamMembers = async(req, res, next)=>{
    try{
        let sql = `
                  select null as _fullname, null as _email, student_id, student_image, students_fullname, students_email from students where subAdmin_Privileges = 1   
                  union
                  select _fullname, _email,null as student_id, null as student_image, null as students_fullname, null as students_email from admin_account
                   `
       const [result]  = await db.query(sql);
       if(!result.length){
        next(new ExpressError(404, "No Team members Found"))
       }else{
        let jsonObject = {}
        const key = "subadmin"
        jsonObject[key] = []

        for(let i = 0; i < result.length-1; i++){
            let details = {
                id: result[i]?.student_id,
                image:JSON.parse(result[i]?.student_image),
                fullname: result[i]?.students_fullname,
                email: result[i]?.students_email
            }
            jsonObject[key].push(details)
        }
        const teamMemberDetails = {
            admin_fullname: result[0]?._fullname,
            admin_email: result[0]?._email,
            jsonObject
        }
        res.status(200).json({teamMemberDetails})
    }
    }catch(error){
        next(error)
    }
}

//POST
const login = async(req, res, next)=>{   
    try{
        const {username, password} = req.body;
        let sql = `select * from students where students_username = ?`;
        const [result] = await db.query(sql, [username])

        if(!result.length){
            next(new ExpressError(400, "Invalid Username and Password"))
        }
        const pass = await bcrypt.compare(password, result[0]?.students_password)
        if(!pass){
            next(new ExpressError(400, "Invalid Username and Password"))
        }
        
        const token = jwt.sign({id: result[0]?.student_id}, process.env.ACCESS_TOKEN);
        res.header(token)
        res.status(200).json(
            {success_message: "You successfully login", sub_admin:{
                id: result[0]?.student_id,
                role: "subadmin",
                subadmin_token: token
            }})
    }catch(error){
        next(error)
    }
}

const addTeacher = async(req, res, next)=> {
    const id = uuidv4();
    const {fullname, email, username, password} = req.body;
    try{
        let sql = `insert into teachers (teacher_id, teachers_fullname,teachers_email,teachers_username,teachers_password) values (?,?,?,?,?)`;
        await db.query(sql, [id, fullname, email, username, password]);

        const url = "Login Website For Teacher"
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Teacher Account For Scheduler',
            html: ` <h3>Welcome to Scheduler App</h3>
                    <hr>
                    <br>
                    Now you can search and join a schedule meeting using an invitation code from the students
                    <br>
                    Login to your account using this username and password below
                    <br>
                    <br>
                    <b>USERNAME: <span style="color: black">${username}</span> </b>
                    <br>
                    <b>PASSWORD: <span style="color: black">${password}</span></b>
                    <br>
                    <br>
                    Please click the <a href=${url} target="_blank">LOGIN PAGE</a> to proceed.
                    <br>  `
        })

        res.status(200).json({success_message: "Successfully Added A Teacher"})
    }catch(error){
        if(error.errno === 1062 && error.sqlMessage == `Duplicate entry '${email}' for key 'teachers.teachers_email'`){
          next(new ExpressError(401, "Email already exist, provide new email"))    
        }
        if(error.errno === 1062 && error.sqlMessage == `Duplicate entry '${username}' for key 'teachers.teachers_username'`){
          next(new ExpressError(401, "Username already exist, provide new username"))    
       }
    }
}

const addVenue = async(req, res, next)=> {
    try{
        const id = uuidv4();
        const {area, room} = req.body;
        let sql = `insert into venues (venue_id, area, room) values (?,?,?)`;
        await db.query(sql, [id, area, room]);
        res.status(200).json({success_message: "Successfully Added A Venue"})
    }catch(error){
        console.log(error)
        if(error.errno === 1062 && error.sqlMessage == `Duplicate entry '${area}' for key 'venues.area'`){
          next(new ExpressError(401, "Area already exist, provide new area"))    
        }
    }
}



//DELETE
const removeTeacher = async(req, res, next)=>{
   try{
    const {id} = req.params;
    let sql = `delete from teachers where teacher_id = ?`;
    const [result] = await db.query(sql, id);
    if(result.affectedRows === 0){
        next(new ExpressError(404, "Teacher Already Been Remove"))
    }else{
    res.status(200).json({success_message: "Successfully Remove The Teacher"})
     }

   }catch(error){
    next(error)
   }
}

const removeStudent = async(req, res, next)=>{
    try{
        const {id} = req.params;
        let sql = `delete from students where student_id = ? and subAdmin_privileges = 0`;
        const [result] = await db.query(sql, id);
        if(result.affectedRows === 0){
            next(new ExpressError(404, "You Cannot Remove Subadmin Privileges Of This Account, Please Contact The Admin"))
        }else{
        res.status(200).json({success_message: "Successfully Remove A Student"})
         }
    }catch(error){
        next(error)
    }
}

const removeVenue = async(req, res, next)=>{
    try{
        const {id} = req.params;
        let sql = `delete from venues where venue_id = ?`;
       const [result] = await db.query(sql, id);

        if(result.affectedRows === 0){
            next(new ExpressError(404, "Venue Already Been Remove"))
        }else{
        res.status(200).json({success_message: "Successfully Remove A Student"})
         }
    }catch(error){
        next(error)
    }
}

module.exports = {
    subAdminProfile,
    allStudent,
    allTeacher,
    allVenues,
    listOfMeeting,
    listOfArchiveMeeting,
    subAdminViewMeeting,
    subAdminViewArchiveMeeting,
    teamMembers,

    login,
    addTeacher,
    addVenue,

    removeStudent,
    removeTeacher,
    removeVenue
}; 