const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const transporter = require("../services/transporter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { cloudinary } = require("../services/cloudinary");
const ExpressError = require("../utils/ExpressError");

const dotenv = require("dotenv");
dotenv.config();
// require("crypto").randomBytes(64).toString('hex')   for jwt token generator

//Get

const studentProfile = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from students where student_id = ?`;
    const [result] = await db.query(sql, [id]);
    if (!result.length) {
      next(new ExpressError(404, "No Profile Found"));
    } else {
      res.status(200).json({
        id: result[0]?.student_id,
        image: JSON.parse(result[0]?.student_image),
        fullname: result[0]?.students_fullname,
        course: result[0]?._course,
        year: result[0]?._year,
        email: result[0]?.students_email,
        active_status: result[0]?.isActive,
        subadmin: result[0]?.subAdmin_Privileges,
      });
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
      next(new ExpressError(404, "No Available Teacher Found"));
    } else {
      let jsonObject = {};
      const key = "teachers";
      jsonObject[key] = [];
      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.teacher_id,
          image: JSON.parse(result[i]?.teacher_image),
          fullname: result[i]?.teachers_fullname,
          email: result[i]?.teachers_email,
          active_status: result[i]?.isActive,
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
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
      next(new ExpressError(404, "No Venue Found"));
    } else {
      let jsonObject = {};
      const key = "venues";
      jsonObject[key] = [];
      for (let i = 0; i < result.length; i++) {
        let details = {
          id: result[i]?.venue_id,
          area: result[i]?.area,
          room: result[i]?.room,
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
    }
  } catch (error) {
    next(error);
  }
};

const availableMeeting = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from meetings 
                    inner join teachers
                    on teachers_id = teacher_id
                    inner join venues
                    on venues_id = venue_id
                    where meeting_code not in 
                    (select access_code from participants where students_id = ?)
                    and views = 1
                    and isArchive = 0
                    and teachers_id is not null
                    and number_participants != (select count(access_code) from participants inner join meetings on access_code = meeting_code)`;

    const [result] = await db.query(sql, [id]);

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
            image: result[i]?.teacher_image,
            fullname: result[i]?.teachers_fullname,
          },
          venue: {
            id: result[i]?.venue_id,
            area: result[i]?.area,
            room: result[i]?.room,
          },
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
    }
  } catch (error) {
    next(error);
  }
};

const creatorPendingMeetings = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from meetings
        inner join venues
        on venues_id = venue_id
        where student_creator_id = ? and teachers_id is null and isArchive = 0`;
    const [result] = await db.query(sql, [id]);
    if (!result.length) {
      next(new ExpressError(404, "No Pending Meetings That You Created"));
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
          venue: {
            id: result[i]?.venue_id,
            area: result[i]?.area,
            room: result[i]?.room,
          },
          views: result[i]?.views,
        };
        jsonObject[key].push(details);
      }
      res.status(200).json(jsonObject);
    }
  } catch (error) {
    next(error);
  }
};

const creatorMyMeetings = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from meetings
        inner join teachers
        on teachers_id = teacher_id
        inner join venues
        on venues_id = venue_id
        where student_creator_id = ? and teachers_id is not null and isArchive = 0`;

    const [result] = await db.query(sql, [id]);
    if (!result.length) {
      next(new ExpressError(404, "No Available Meetings That You Created"));
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

const creatorViewMeeting = async (req, res, next) => {
  const id = req.user;
  const { code } = req.params;
  try {
    let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                    teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                    inner join students
                    on student_creator_id = students.student_id
                    inner join teachers
                    on teachers_id = teachers.teacher_id
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
                    where access_code = ? and  isArchive = 0
                    `;

    const [result] = await db.query(sql, [code, code]);

    if (!result.length) {
      next(
        new ExpressError(404, "No Content Available, Please Contact Support")
      );
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
          id: result[0]?.venue_id,
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

const participantMyMeetings = async (req, res, next) => {
  const id = req.user;
  try {
    let sqlExist = `select * from participants where students_id = ?`;
    const [exist] = await db.query(sqlExist, [id]);
    //console.log(exist)
    if (!exist.length) {
      next(new ExpressError(404, "No Available Joined Meetings"));
    } else {
      let sql = `select * from meetings
            inner join participants
            on meeting_code = access_code
            inner join teachers
            on teachers_id = teacher_id
            inner join venues
            on venues_id = venue_id
            where students_id = ? and  teachers_id is not null and  isArchive = 0`;

      const [result] = await db.query(sql, [id]);

      if (!result.length) {
        next(new ExpressError(404, "No Available Meetings That You Joined"));
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
    }
  } catch (error) {
    next(error);
  }
};

const participantViewMeetings = async (req, res, next) => {
  const id = req.user;
  const { code } = req.params;
  try {
    let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                inner join students
                on student_creator_id = students.student_id
                inner join teachers
                on teachers_id = teachers.teacher_id
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
                where access_code = ? and isArchive = 0`;

    const [result] = await db.query(sql, [code, code]);

    if (!result.length) {
      next(
        new ExpressError(404, "No Content Available, Please Contact Support")
      );
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
          id: result[0]?.venue_id,
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
//Archive

const creatorArchiveMeetings = async (req, res, next) => {
  const id = req.user;
  try {
    let sql = `select * from meetings 
        inner join teachers
        on teachers_id = teacher_id
        inner join venues
        on venues_id = venue_id
        where student_creator_id = ? and teachers_id is not null and isArchive = 1`;

    const [result] = await db.query(sql, [id]);
    if (!result.length) {
      next(
        new ExpressError(404, "No Available Archive Meetings That You Created")
      );
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

const creatorViewArchiveMeeting = async (req, res, next) => {
  const id = req.user;
  const { code } = req.params;
  try {
    let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                    teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                    inner join students
                    on student_creator_id = students.student_id
                    inner join teachers
                    on teachers_id = teachers.teacher_id
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
      next(
        new ExpressError(404, "No Content Available, Please Contact Support")
      );
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
          id: result[0]?.venue_id,
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

const participantArchiveMeetings = async (req, res, next) => {
  const id = req.user;
  try {
    let sqlExist = `select * from participants where students_id = ?`;
    const [exist] = await db.query(sqlExist, [id]);

    if (!exist.length) {
      next(new ExpressError(404, "No Available Archived Meetings"));
    } else {
      let sql = `select * from meetings
            inner join participants
            on meeting_code = access_code
            inner join teachers
            on teachers_id = teacher_id
            inner join venues
            on venues_id = venue_id
            where students_id = ? and isArchive = 1`;

      const [result] = await db.query(sql, [id]);

      if (!result.length) {
        next(new ExpressError(404, "No Available Archived Meetings"));
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
    }
  } catch (error) {
    next(error);
  }
};

const participantViewArchiveMeetings = async (req, res, next) => {
  const id = req.user;
  const { code } = req.params;
  try {
    let sql = `select meeting_id, meeting_code, meeting_date, meeting_day, time_start, time_end, area, room, views, postponed, postponed_reason, teacher_image,
                teachers_fullname, student_id, student_image, students_fullname, _course, _year from meetings
                inner join students
                on student_creator_id = students.student_id
                inner join teachers
                on teachers_id = teachers.teacher_id
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
                where access_code = ? and isArchive = 1`;

    const [result] = await db.query(sql, [code, code]);

    if (!result.length) {
      next(
        new ExpressError(404, "No Content Available, Please Contact Support")
      );
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
          id: result[0]?.venue_id,
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

//Post
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let sql = `select * from students where students_username = ?`;
    const [result] = await db.query(sql, [username]);

    if (!result.length) {
      next(new ExpressError(400, "Invalid Username and Password"));
    } else {
      const pass = await bcrypt.compare(password, result[0]?.students_password);
      if (!pass) {
        next(new ExpressError(400, "Invalid Username and Password"));
      } else {
        if (result[0]?.isVerified === 0) {
          next(
            new ExpressError(
              400,
              "This Account Has Not Yet Been Veried, Please Check Your Email To Verify Your Account"
            )
          );
        } else {
          const token = jwt.sign(
            { id: result[0]?.student_id },
            process.env.ACCESS_TOKEN
          );
          res.header(token);
          res.status(200).json({
            success_message: "You successfully Login",
            student: {
              id: result[0]?.student_id,
              role: "student",
              token: token,
            },
          });

          let updateStatus = `update students set isActive = 1`;
          await db.query(`set sql_safe_updates = 0`);
          await db.query(updateStatus);
          await db.query(`set sql_safe_updates = 1`);
        }
      }
    }
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  const id = uuidv4();
  const { fullname, course, year, email, username, password } = req.body;
  console.log(req.body);

  try {
    const cjcemail = email.split("@");
    if (cjcemail[1] !== "g.cjc.edu.ph") {
      next(
        new ExpressError(400, "Please Use The Provided Email Of The School")
      );
    } else {
      let sql = `insert into students (
                            student_id,
                            students_fullname,
                            _course,
                            _year,
                            students_email,
                            students_username,
                            students_password
                    ) values (?,?,?,?,?,?,?)`;
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(sql, [
        id,
        fullname,
        course,
        year,
        email,
        username,
        hashedPassword,
      ]);
      const verifyToken = jwt.sign({ id: id }, process.env.ACCESS_TOKEN);
      console.log(id);
      console.log(verifyToken);
      const url = `https://ccis-scheduler.onrender.com/verify-account/${id}/${verifyToken}`; //localhost:5000/api/student/verify-signup/${id}/${verify_token} react front end useparams then display useEffect

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "Scheduler Signup Verification",
        html: `<b>Welcome to Scheduler App</b>
                        <hr>
                        <br> 
                        <br>
                        You're all set. Now you can create or join meetings for particullar reason you want to address to the teacher
                        <br>
                        Please click the verify account button.
                        <br>
                        Click the <a href=${url} target="_blank">VERIFY ACCOUNT</a> to procceed`,
      });

      res.status(200).json({
        success_message:
          "Your account has been successfully created, Please Check Your Email To Verify Your Account",
      });
    }
  } catch (error) {
    console.log(error);
    if (
      error.errno === 1062 &&
      error.sqlMessage ==
        `Duplicate entry '${email}' for key 'students.students_email'`
    ) {
      next(new ExpressError(401, "Email already exist, provide new email"));
    }
    if (
      error.errno === 1062 &&
      error.sqlMessage ==
        `Duplicate entry '${username}' for key 'students.students_username'`
    ) {
      next(
        new ExpressError(401, "Username already exist, provide new username")
      );
    }
  }
};

const verifySignup = async (req, res, next) => {
  try {
    const { id, verify_token } = req.params;
    const sql = `select * from students where student_id = ?`;
    const [result] = await db.query(sql, [id]);
    const verifyJWT = jwt.verify(verify_token, process.env.ACCESS_TOKEN);
    if (!verifyJWT) {
      next(new ExpressError(401, "Access Denied"));
    } else if (result[0]?.isVerified === 1) {
      next(new ExpressError(400, "Your Account Is Already Verified"));
    } else {
      const verify = `update students set isVerified = 1 where student_id = ?`;
      await db.query(`set sql_safe_updates = 0`);
      await db.query(verify, [id]);
      await db.query(`set sql_safe_updates = 1`);
      res.status(200).json({
        success_message:
          "Your Account Has Been Verified, You Can Now Login Your Account",
      });
    }
  } catch (error) {
    next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const id = req.user;
    const { title, description, date, day, start, end, venue_id } = req.body;

    const code = crypto.randomBytes(4).toString("hex").toLocaleUpperCase();
    const meeting_id = uuidv4();

    let sql = `insert into meetings (
                        meeting_id,
                        meeting_code,
                        meeting_title,
                        meeting_description,
                        meeting_date,
                        meeting_day,
                        time_start,
                        time_end,
                        venues_id,
                        student_creator_id
                )values(?,?,?,?,?,?,?,?,?,?)`;
    await db.query(sql, [
      meeting_id,
      code,
      title,
      description,
      date,
      day,
      start,
      end,
      venue_id,
      id,
    ]);
    res
      .status(200)
      .json({ success_message: "You Succesfully Create A Meeting" });
  } catch (error) {
    next(error);
  }
};

const joinMeeting = async (req, res, next) => {
  try {
    const id = req.user;
    const { code } = req.params;
    const part_id = uuidv4();

    let sqlexist = `select * from participants where access_code = ? and students_id = ?`;
    const [exist] = await db.query(sqlexist, [code, id]);

    if (exist.length) {
      next(new ExpressError(400, "You Already Join The Meeting"));
    } else {
      let sql = `insert into participants (participant_id, access_code, students_id) 
                            values(?, ?, ?)`;

      await db.query(sql, [part_id, code, id]);
      res
        .status(200)
        .json({ success_message: "You Succesfully Join The Meeting" });
    }
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
      subject: "Verification Code",
      html: `This verification code will expires within 6 minutes
                <br> 
                verification code: ${code}`,
    });
    res.status(200).json({ email_token: emailCodeToken });
  } catch (error) {
    next(error);
  }
};

//patch
const updateStatusIfSignOut = async (req, res, next) => {
  try {
    const id = req.user;
    let sql = `update students set isActive = 0 where student_id = ?`;
    await db.query(`set sql_safe_updates = 0`);
    await db.query(sql, [id]);
    await db.query(`set sql_safe_updates = 1`);

    res.status(200).json({ success_message: "Sign Out" });
  } catch (error) {
    next(error);
  }
};

const updateProfilePic = async (req, res, next) => {
  try {
    const id = req.user;
    const { filename } = req.body;
    const image = { url: req.file.path, filename: req.file.filename };
    const imageStringify = JSON.stringify(image);

    let sql = `update students set student_image = ? where student_id = ?`;
    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [imageStringify, id]);
    await db.query(`set sql_safe_updates = 1`);

    if (result.affectedRows === 0) {
      next(new ExpressError(404, "Profile Picture Already Been Updated"));
    } else {
      if (filename) {
        await cloudinary.uploader.destroy(filename);
      }
      res
        .status(200)
        .json({ success_message: "Profile Picture Has Been Change" });
    }
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const id = req.user;
    const { fullname, course, year, email } = req.body;

    let sql = `update students set   
                        students_fullname = ?,
                        _course = ?,
                        _year = ?,
                        students_email = ?
                    where student_id = ?`;
    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [fullname, course, year, email, id]);
    await db.query(`set sql_safe_updates = 1`);

    const cjcemail = email.split("@");
    if (cjcemail[1] !== "g.cjc.edu.ph") {
      next(
        new ExpressError(400, "Please Use The Provided Email Of The School")
      );
    } else {
      if (result.affectedRows === 0) {
        next(new ExpressError(404, "Profile Already Been Updated"));
      } else {
        res.status(200).json({ success_message: "Profile Has Been Updated" });
      }
    }
  } catch (error) {
    next(error);
  }
};

const updateUsername = async (req, res, next) => {
  try {
    const { id, _code } = req.user;
    const { username, code } = req.body;
    if (_code !== code) {
      next(new ExpressError(401, "Invalid Verification Code"));
    } else {
      let sql = `update students set   
                        students_username = ?
                        where student_id = ?`;

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
      let sql = `update students set   
                        students_password = ?
                        where student_id = ?`;
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
const updatePendingMeeting = async (req, res, next) => {
  try {
    const id = req.user;
    const { code } = req.params;
    const { title, description, date, day, start, end, venue_id } = req.body;

    let sql = `update meetings set 
                        meeting_title = ?,
                        meeting_description = ?,
                        meeting_date = ?,
                        meeting_day = ?,
                        time_start = ?,
                        time_end = ?,
                        venues_id = ?
                    where student_creator_id = ? and meeting_code = ?`;

    //await db.query(`set sql_safe_updates = 0`)
    await db.query(sql, [
      title,
      description,
      date,
      day,
      start,
      end,
      venue_id,
      id,
      code,
    ]);
    //await db.query(`set sql_safe_updates = 1`)
    res
      .status(200)
      .json({ success_message: "Meeting Details has been updated" });
  } catch (error) {
    next(error);
  }
};

const updateMeetingViewsPrivate = async (req, res) => {
  try {
    const id = req.user;
    const { code } = req.params;

    let sql = `update meetings set views = 0 where student_creator_id = ? and meeting_code = ?`;
    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [id, code]);
    await db.query(`set sql_safe_updates = 1`);
    res.status(200).json({ success_message: "Meeting has been updated" });
  } catch (error) {
    next(error);
  }
};

const updateMeetingViewsPublic = async (req, res) => {
  try {
    const id = req.user;
    const { code } = req.params;

    let sql = `update meetings set views = 1 where student_creator_id = ? and meeting_code = ?`;
    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [id, code]);
    await db.query(`set sql_safe_updates = 1`);
    res.status(200).json({ success_message: "Meeting has been updated" });
  } catch (error) {
    next(error);
  }
};

const archiveMeeting = async (req, res, next) => {
  try {
    const id = req.user;
    const { code } = req.params;
    let sql = `update meetings set isArchive = 1 where student_creator_id = ? and meeting_code = ?`;

    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [id, code]);
    await db.query(`set sql_safe_updates = 1`);
    if (result.affectedRows === 0) {
      next(new ExpressError(400, "Please Try Again"));
    } else {
      res.status(200).json({ success_message: "Archived Meeting Succefully" });
    }
  } catch (error) {
    next(error);
  }
};

//delete

const removeProfilePic = async (req, res, next) => {
  try {
    const id = req.user;
    const { filename } = req.params;

    let sql = `update students set student_image = null where student_id = ?`;
    await db.query(`set sql_safe_updates = 0`);
    const [result] = await db.query(sql, [id]);
    await db.query(`set sql_safe_updates = 1`);
    if (result.affectedRows === 0) {
      next(new ExpressError(404, "Profile Picture Already Been Remove"));
    } else {
      if (filename) {
        await cloudinary.uploader.destroy(filename);
      }
      res
        .status(200)
        .json({ success_message: "Profile Picture Is Back To Default" });
    }
  } catch (error) {
    next(error);
  }
};

const deleteMeetingCreator = async (req, res) => {
  try {
    const id = req.user;
    const { code } = req.params;
    // let sql = `update meetings set student_creator_id = null where student_creator_id = ? and meeting_code = ?`

    let deleteMeetingSql = `delete from meetings where student_creator_id = ? and meeting_code = ?`;
    await db.query(deleteMeetingSql, [id, code]);

    let deleteParticipantSql = `delete from participants where access_code = ?`;
    await db.query(deleteParticipantSql, [code]);

    res
      .status(200)
      .json({ success_message: "You Succesfully Delete The Meeting" });
  } catch (error) {
    next(error);
  }
};

const leaveMeetingParticipants = async (req, res) => {
  try {
    const id = req.user;
    const { code } = req.params;
    let sql = `delete from participants where students_id = ? and access_code = ?`;
    await db.query(sql, [id, code]);
    res.status(200).json({ success_message: "You Leave The Meeting" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  //GET
  studentProfile,
  allTeacher,
  allVenues,
  availableMeeting,

  creatorPendingMeetings,
  creatorMyMeetings,
  creatorViewMeeting,
  participantMyMeetings,
  participantViewMeetings,

  creatorArchiveMeetings,
  creatorViewArchiveMeeting,
  participantArchiveMeetings,
  participantViewArchiveMeetings,
  //POST
  login,
  signup,
  verifySignup,
  createMeeting,
  joinMeeting,
  confirmCredentials,

  //PATCH
  //no thunderclient yet and studentApi ROUTE
  updateStatusIfSignOut,
  updateProfile,
  updateProfilePic,
  updateUsername,
  updatePassword,
  updatePendingMeeting,
  updateMeetingViewsPrivate,
  updateMeetingViewsPublic,
  archiveMeeting,

  //DELETE
  removeProfilePic,
  deleteMeetingCreator,
  leaveMeetingParticipants,
};
