const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const ExpressError = require("../utils/ExpressError");
const transporter = require("../services/transporter");
const XLSX = require("xlsx");

require("dotenv").config();

//Get
const adminProfile = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from admin_account where admin_id = ? `;
    const [result] = await db.query(sql, [id]);
    if (!result.length) {
      next(new ExpressError(404, "No Profile Found"));
    } else {
      res.status(200).json({
        fullname: result[0]?._fullname,
        email: result[0]?._email,
      });
    }
  } catch (error) {
    next(error);
  }
};

const allStudent = async (req, res, next) => {
  try {
    let sql = `select * from students order by _year desc`;
    const [result] = await db.query(sql);

    if (!result.length) {
      next(new ExpressError(404, "No Students Available"));
    } else {
      let studentObject = {};
      const key = "students";
      studentObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.student_id,
          image: JSON.parse(result[i]?.student_image),
          fullname: result[i]?.students_fullname,
          email: result[i]?.students_email,
          course: result[i]?._course,
          year: result[i]?._year,
          sub_admin: result[i]?.subAdmin_Privilieges,
        };
        studentObject[key].push(details);
      }
      res.status(200).json({ studentObject });
    }
  } catch (error) {
    next(error);
  }
};

const allTeacher = async (req, res, next) => {
  try {
    let sql = `select * from teachers`;
    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Teachers Available"));
    } else {
      let teacherObject = {};
      const key = "teachers";
      teacherObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.teacher_id,
          image: JSON.parse(result[i]?.teacher_image),
          fullname: result[i]?.teachers_fullname,
          email: result[i]?.teachers_email,
        };
        teacherObject[key].push(details);
      }
      res.status(200).json({ teacherObject });
    }
  } catch (error) {
    next(error);
  }
};

const allVenues = async (req, res, next) => {
  try {
    let sql = `select * from venues`;
    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Venues Available"));
    } else {
      let venueObject = {};
      const key = "venues";
      venueObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.venue_id,
          area: result[i]?.area,
          room: result[i]?.room,
        };
        venueObject[key].push(details);
      }
      res.status(200).json({ venueObject });
    }
  } catch (error) {
    next(error);
  }
};

const listOfMeeting = async (req, res, next) => {
  try {
    let sql = `select * from meetings 
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id   
                    where isArchive = 0`;

    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Available Meetings"));
    } else {
      let jsonObject = {};
      const key = "meetings";
      jsonObject[key] = [];
      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.meeting_id,
          code: result[i]?.meeting_code,
          title: result[i]?.meeting_title,
          description: result[i]?.meeting_description,
          date: result[i]?.meeting_date,
          day: result[i]?.meeting_day,
          time: {
            start: result[i]?.time_start,
            end: result[i]?.time_end,
          },
          teacher: {
            image: JSON.parse(result[i]?.teacher_image),
            fullname: result[i]?.teachers_fullname,
          },
          venue: {
            id: result[i]?.venue_id,
            area: result[i]?.area,
            room: result[i]?.room,
          },
          views: result[i]?.views,
          postponed: result[i]?.postponed,
          reason: result[i]?.postponed_reason,
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
    }
  } catch (error) {
    next(error);
  }
};

const listOfArchiveMeeting = async (req, res, next) => {
  try {
    let sql = `select * from meetings 
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id
                    where isArchive = 1`;

    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Available Archive Meetings"));
    } else {
      let jsonObject = {};
      const key = "meetings";
      jsonObject[key] = [];
      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.meeting_id,
          code: result[i]?.meeting_code,
          title: result[i]?.meeting_title,
          description: result[i]?.meeting_description,
          date: result[i]?.meeting_date,
          day: result[i]?.meeting_day,
          time: {
            start: result[i]?.time_start,
            end: result[i]?.time_end,
          },
          teacher: {
            image: JSON.parse(result[i]?.teacher_image),
            fullname: result[i]?.teachers_fullname,
          },
          venue: {
            id: result[i]?.venue_id,
            area: result[i]?.area,
            room: result[i]?.room,
          },
          views: result[i]?.views,
          postponed: result[i]?.postponed,
          reason: result[i]?.postponed_reason,
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
    }
  } catch (error) {
    next(error);
  }
};

const adminViewMeeting = async (req, res, next) => {
  try {
    const { code } = req.params;
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
                    `;

    const [result] = await db.query(sql, [code, code]);

    if (!result.length) {
      next(new ExpressError(404, "No Content Available"));
    } else {
      let studentObject = {};
      const key = "students";
      studentObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.student_id,
          image: JSON.parse(result[i]?.student_image),
          fullname: result[i]?.students_fullname,
          course: result[i]?._course,
          year: result[i]?._year,
          image: result[i]?.image,
        };
        studentObject[key].push(details);
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
          end: result[0]?.time_end,
        },
        venue: {
          area: result[0]?.area,
          room: result[0]?.room,
        },
        teacher: {
          image: JSON.parse(result[0]?.teacher_image),
          fullname: result[0]?.teachers_fullname,
        },
        studentObject,
        views: result[0]?.views,
        postponed: result[0]?.postponed,
        reason: result[0]?.postponed_reason,
      };
      res.status(200).json({ meetingDetails });
    }
  } catch (error) {
    next(error);
  }
};

const downloadExcelSheet = async (req, res, next) => {
  let meetingObject = {};
  let archivedMeetingObject = {};
  let studentObject = {};
  let teacherObject = {};
  let venueObject = {};

  try {
    let sql = `select * from meetings 
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id   
                    where isArchive = 0`;

    const [result] = await db.query(sql);
    const key = "meetings";
    meetingObject[key] = [];
    for (let i = 0; i < result.length; i++) {
      let details = {
        id: result[i]?.meeting_id,
        code: result[i]?.meeting_code,
        title: result[i]?.meeting_title,
        description: result[i]?.meeting_description,
        date: result[i]?.meeting_date,
        day: result[i]?.meeting_day,
        time: `${result[i]?.time_start} - ${result[i]?.time_end}`,
        teacher: result[i]?.teachers_fullname,
        venue: `${result[i]?.area} / Room ${result[i]?.room}`,
        views: result[i]?.views,
        postponed: result[i]?.postponed,
        reason: result[i]?.postponed_reason,
      };
      meetingObject[key].push(details);
    }
  } catch (error) {
    next(error);
  }

  try {
    let sql = `select * from meetings 
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id
                    where isArchive = 1`;

    const [result] = await db.query(sql);
    const key = "meetings";
    archivedMeetingObject[key] = [];
    for (let i = 0; i < result.length; i++) {
      let details = {
        id: result[i]?.meeting_id,
        code: result[i]?.meeting_code,
        title: result[i]?.meeting_title,
        description: result[i]?.meeting_description,
        date: result[i]?.meeting_date,
        day: result[i]?.meeting_day,
        time: `${result[i]?.time_start} - ${result[i]?.time_end}`,
        teacher: result[i]?.teachers_fullname,
        venue: `${result[i]?.area} / Room ${result[i]?.room}`,
        views: result[i]?.views,
        postponed: result[i]?.postponed,
        reason: result[i]?.postponed_reason,
      };
      archivedMeetingObject[key].push(details);
    }
  } catch (error) {
    next(error);
  }

  try {
    let sql = `select * from students order by _year desc`;
    const [result] = await db.query(sql);

    const key = "students";
    studentObject[key] = [];

    for (let i = 0; i < result.length; i++) {
      let details = {
        id: result[i]?.student_id,
        image: JSON.parse(result[i]?.student_image),
        fullname: result[i]?.students_fullname,
        email: result[i]?.students_email,
        course: result[i]?._course,
        year: result[i]?._year,
        sub_admin: result[i]?.subAdmin_Privilieges,
      };
      studentObject[key].push(details);
    }
  } catch (error) {
    next(error);
  }

  try {
    let sql = `select * from teachers`;
    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Teachers Available"));
    } else {
      const key = "teachers";
      teacherObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.teacher_id,
          image: JSON.parse(result[i]?.teacher_image),
          fullname: result[i]?.teachers_fullname,
          email: result[i]?.teachers_email,
        };
        teacherObject[key].push(details);
      }
    }
  } catch (error) {
    next(error);
  }

  try {
    let sql = `select * from venues`;
    const [result] = await db.query(sql);
    const key = "venues";
    venueObject[key] = [];

    for (let i = 0; i < result.length; i++) {
      let details = {
        id: result[i]?.venue_id,
        area: result[i]?.area,
        room: result[i]?.room,
      };
      venueObject[key].push(details);
    }
  } catch (error) {
    next(error);
  }

  const meetingsWorksheet = XLSX.utils.json_to_sheet(meetingObject.meetings);
  const archivedMeetingsWorksheet = XLSX.utils.json_to_sheet(
    archivedMeetingObject.meetings
  );
  const studentsWorksheet = XLSX.utils.json_to_sheet(studentObject.students);
  const teachersWorksheet = XLSX.utils.json_to_sheet(teacherObject.teachers);
  const venuesWorksheet = XLSX.utils.json_to_sheet(venueObject.venues);

  const schedulerWorkbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    schedulerWorkbook,
    meetingsWorksheet,
    "Meetings"
  );

  XLSX.utils.book_append_sheet(
    schedulerWorkbook,
    archivedMeetingsWorksheet,
    "Archived-Meetings"
  );

  XLSX.utils.book_append_sheet(
    schedulerWorkbook,
    studentsWorksheet,
    "Students"
  );

  XLSX.utils.book_append_sheet(
    schedulerWorkbook,
    teachersWorksheet,
    "Teachers"
  );

  XLSX.utils.book_append_sheet(
    schedulerWorkbook,
    venuesWorksheet,
    "Venues"
  );

  const buf = XLSX.write(schedulerWorkbook, {
    type: "buffer",
    bookType: "xlsx",
  });
  res.attachment("ccis-scheduler-data.xlsx");

  res.status(200).end(buf);
};

const adminViewArchivedMeeting = async (req, res, next) => {
  try {
    const { code } = req.params;
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
                    `;

    const [result] = await db.query(sql, [code, code]);

    if (!result.length) {
      next(new ExpressError(404, "No Content Available"));
    } else {
      let studentObject = {};
      const key = "students";
      studentObject[key] = [];

      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.student_id,
          image: JSON.parse(result[i]?.student_image),
          fullname: result[i]?.students_fullname,
          course: result[i]?._course,
          year: result[i]?._year,
          image: result[i]?.image,
        };
        studentObject[key].push(details);
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
          end: result[0]?.time_end,
        },
        venue: {
          area: result[0]?.area,
          room: result[0]?.room,
        },
        teacher: {
          image: JSON.parse(result[0]?.teacher_image),
          fullname: result[0]?.teachers_fullname,
        },
        studentObject,
        views: result[0]?.views,
        postponed: result[0]?.postponed,
        reason: result[0]?.postponed_reason,
      };
      res.status(200).json({ meetingDetails });
    }
  } catch (error) {
    next(error);
  }
};

const teamMembers = async (req, res, next) => {
  try {
    let sql = `select null as _fullname, null as _email, student_id, student_image, students_fullname, students_email from students where subAdmin_Privileges = 1   
        union
        select _fullname, _email,null as student_id, null as student_image, null as students_fullname, null as students_email from admin_account`;
    const [result] = await db.query(sql);
    if (!result.length) {
      next(new ExpressError(404, "No Team members Found"));
    } else {
      let jsonObject = {};
      const key = "subadmin";
      jsonObject[key] = [];

      for (let i = 0; i < result.length - 1; i++) {
        let details = {
          id: result[i]?.student_id,
          image: JSON.parse(result[i]?.student_image),
          fullname: result[i]?.students_fullname,
          email: result[i]?.students_email,
        };
        jsonObject[key].push(details);
      }
      const teamMemberDetails = {
        admin_fullname: result[0]?._fullname,
        admin_email: result[0]?._email,
        jsonObject,
      };
      res.status(200).json({ teamMemberDetails });
    }
  } catch (error) {
    next(error);
  }
};

//POST
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let sql = `select * from admin_account where _username = ?`;
    const [result] = await db.query(sql, [username]);

    if (!result.length) {
      next(new ExpressError(400, "Invalid Admin Username and Password"));
    } else {
      const pass = await bcrypt.compare(password, result[0]?._password);
      if (!pass) {
        next(new ExpressError(400, "Invalid Admin Username and Password"));
      } else {
        const token = jwt.sign(
          { id: result[0]?.admin_id },
          process.env.ACCESS_TOKEN
        );
        res.header(token);
        res.status(200).json({
          success_message: "You successfully login",
          admin: {
            id: result[0]?.admin_id,
            role: "admin",
            token: token,
          },
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

const signUpAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    let exist = `select * from admin_account`;
    const [result] = await db.query(exist);
    if (result.length) {
      next(new ExpressError(401, "Admin Account Already Exist"));
    } else {
      let sql = `insert into admin_account (_username, _password) values (?,?)`;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(`set sql_safe_updates = 0`);
      await db.query(sql, [username, hashedPassword]);
      await db.query(`set sql_safe_updates = 1`);

      res.status(200).json({ success_message: "Admin Signup Success" });
    }
  } catch (error) {
    next(error);
  }
};

// const addProfile = async(req, res, next)=>{
//     try{
//         const id = req.user;
//         const {fullname, email} = req.body;
//         let sql = `insert into admin_account (_fullname, _email) values (?,?) where admin_id = ?`
//         await db.query(`set sql_safe_updates = 0`)
//         await db.query(sql, [fullname, email, id])
//         await db.query(`set sql_safe_updates = 1`)

//         res.status(200).json({success_message: "Profile Updated Succesfully"})
//     }catch(error){

//     }
// }

const addTeacher = async (req, res, next) => {
  const id = uuidv4();
  const { fullname, email, username, password } = req.body;
  try {
    let sql = `insert into teachers (teacher_id, teachers_fullname,teachers_email,teachers_username,teachers_password) values (?,?,?,?,?)`;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(sql, [id, fullname, email, username, hashedPassword]);

    const url = "https://www.youtube.com/"; //react link for teachers login
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Teacher Account For Scheduler",
      html: `
                   <h3>Welcome to Scheduler App</h3>
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
                   <br> `,
    });

    res.status(200).json({ success_message: "Successfully Added A Teacher" });
  } catch (error) {
    if (
      error.errno === 1062 &&
      error.sqlMessage ==
        `Duplicate entry '${email}' for key 'teachers.teachers_email'`
    ) {
      next(new ExpressError(401, "Email already exist, provide new email"));
    }
    if (
      error.errno === 1062 &&
      error.sqlMessage ==
        `Duplicate entry '${username}' for key 'teachers.teachers_username'`
    ) {
      next(
        new ExpressError(401, "Username already exist, provide new username")
      );
    }
  }
};

const addVenue = async (req, res, next) => {
  try {
    const id = uuidv4();
    const { area, room } = req.body;
    let sql = `insert into venues (venue_id, area, room) values (?,?,?)`;
    await db.query(sql, [id, area, room]);
    res.status(200).json({ success_message: "Successfully Added A Venue" });
  } catch (error) {
    console.log(error);
    if (
      error.errno === 1062 &&
      error.sqlMessage == `Duplicate entry '${area}' for key 'venues.area'`
    ) {
      next(new ExpressError(401, "Area already exist, provide new area"));
    }
  }
};

const addSubAdmins = async (req, res, next) => {
  const { id, email } = req.params;
  try {
    let sql = `update students set subAdmin_Privileges = 1 where student_id = ?`;
    await db.query(sql, [id]);

    const url = "Login Website For SubAdmin";
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Sub Admin",
      html: `You have been added as Sub Admin to manage the Scheuler App
                   <br>
                   User your current username and password
                   <br>
                   Click the url to redirect you to the login in page
                   <br>
                    Link to login page ${url}`,
    });
    res.status(200).json({ success_message: "Successfully Added A Subaddmin" });
  } catch (error) {
    next(error);
  }
};

const confirmCredentials = async (req, res, next) => {
  try {
    const id = req.user;
    const { email } = req.body;

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const emailCodeToken = jwt.sign(
      { id: id, code: code },
      process.env.EMAIL_CODE_TOKEN,
      { expiresIn: "6m" }
    );
    res.header(emailCodeToken);

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Admin Verification Code",
      html: `This verification code will expires within 6 minutes
                <br> 
                verification code: ${code}`,
    });
    res.status(200).json({ email_admin_token: emailCodeToken });
  } catch (error) {
    next(error);
  }
};

//Patch

const updateProfile = async (req, res, next) => {
  try {
    const id = req.user;
    const { fullname, email } = req.body;
    let sql = `update admin_account set _fullname = ?, _email = ? where admin_id = ?`;
    await db.query(`set sql_safe_updates = 0`);
    await db.query(sql, [fullname, email, id]);
    await db.query(`set sql_safe_updates = 1`);

    res.status(200).json({ success_message: "Profile Updated Succesfully" });
  } catch (error) {}
};

const updateUsername = async (req, res, next) => {
  try {
    const { id, _code } = req.user;
    const { username, code } = req.body;
    if (!req.user.id && _code !== req.user.code) {
      next(new ExpressError(401, "Invalid Verification Code"));
    } else {
      let sql = `update admin_account set   
                        _username = ?
                        where admin_id = ?`;

      await db.query(`set sql_safe_updates = 0`);
      await db.query(sql, [username, id]);
      await db.query(`set sql_safe_updates = 1`);

      res.status(200).json({ success_message: "Username Succesfully Updated" });
    }
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { id, _code } = req.user;
    const { password, code } = req.body;
    if (_code !== code) {
      next(new ExpressError(401, "Invalid Verification Code"));
    } else {
      let sql = `update admin_account set   
                        _password = ?
                        where admin_id = ?`;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(`set sql_safe_updates = 0`);
      await db.query(sql, [hashedPassword, id]);
      await db.query(`set sql_safe_updates = 1`);

      res.status(200).json({ success_message: "Password Succesfully Update" });
    }
  } catch (error) {
    next(error);
  }
};

//DELETE
const removeTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sql = `delete from teachers where teacher_id = ?`;
    const [result] = await db.query(sql, id);
    if (result.affectedRows === 0) {
      next(new ExpressError(404, "Teacher Already Been Remove"));
    } else {
      res
        .status(200)
        .json({ success_message: "Successfully Remove A Teacher" });
    }
  } catch (error) {
    next(error);
  }
};

const removeStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sql = `delete from students where student_id = ? and subAdmin_Privileges = 0`;
    const [result] = await db.query(sql, id);
    if (result.affectedRows === 0) {
      next(
        new ExpressError(
          404,
          "Please Remove Subadmin Privileges Of This Account"
        )
      );
    } else {
      res
        .status(200)
        .json({ success_message: "Successfully Remove A Student" });
    }
  } catch (error) {
    next(error);
  }
};

const removeVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    let sql = `delete from venues where venue_id = ?`;
    const [result] = await db.query(sql, id);
    if (result.affectedRows === 0) {
      next(new ExpressError(404, "Venue Already Been Remove"));
    } else {
      res.status(200).json({ success_message: "Successfully Remove A Venue" });
    }
  } catch (error) {
    next(error);
  }
};

const removeSubAdmins = async (req, res, next) => {
  const { id } = req.params;
  try {
    let sql = `update students set subAdmin_Privileges = 0 where student_id = ?`;
    const [result] = await db.query(sql, [id]);
    if (result.affectedRows === 0) {
      next(new ExpressError(404, "Subadmin Already Been Deleted"));
    } else {
      res
        .status(200)
        .json({ success_message: "Successfully reomve A Subaddmin" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminProfile,
  allStudent,
  allTeacher,
  allVenues,
  listOfMeeting,
  listOfArchiveMeeting,
  adminViewMeeting,
  adminViewArchivedMeeting,
  teamMembers,
  downloadExcelSheet,

  login,
  signUpAdmin,
  addTeacher,
  addVenue,
  addSubAdmins,
  confirmCredentials,

  updateProfile,
  updateUsername,
  updatePassword,

  removeStudent,
  removeTeacher,
  removeVenue,
  removeSubAdmins,
};
