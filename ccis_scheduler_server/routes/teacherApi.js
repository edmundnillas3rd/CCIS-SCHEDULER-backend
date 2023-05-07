const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacher")
const jwtVerify = require("../middleware/verifyJWT")
const verifyCode = require("../middleware/verifyCode")
const multer = require("multer")
const {storage} = require("../services/cloudinary");
const upload = multer({storage})

//GET 
router.get("/profile",jwtVerify, teacherController.teacherProfile)
router.get("/all-students",jwtVerify, teacherController.allStudent)
router.get("/all-venues", jwtVerify, teacherController.allVenues)
router.get("/search-meeting", jwtVerify,teacherController.seachMeetingCode)
router.get("/pending-meetings", jwtVerify, teacherController.pendingMeetings);
router.get("/my-meetings", jwtVerify, teacherController.teacherMyMeetings)
router.get("/archive-meetings", jwtVerify, teacherController.teacherArchiveMeetings)
router.get("/:code/view-meeting", jwtVerify, teacherController.teacherViewMeeting)
router.get("/:code/view-archive-meeting", jwtVerify, teacherController.teacherViewArchiveMeeting)
//POST
router.post("/login", teacherController.login)
router.post("/confirm-credentials", jwtVerify, teacherController.confirmCredentials)
//PATCH
router.patch("/signout", jwtVerify, teacherController.updateStatusIfSignOut)
router.patch("/update-profile", jwtVerify, teacherController.updateProfile)
router.patch("/update-profile-pic", jwtVerify, upload.single("image"), teacherController.updateProfilePic)
router.patch("/update-username", verifyCode, teacherController.updateUsername)
router.patch("/update-password", verifyCode, teacherController.updatePassword)
router.patch("/:code/join-meeting", jwtVerify,teacherController.joinMeeting)
router.patch("/:code/postponed-meeting", jwtVerify, teacherController.postponedMeeting)
router.patch("/:code/limit-number-participants", jwtVerify,teacherController.limitParticipants)

//DELETE
router.delete("/:filename/remove-profile-pic",jwtVerify, teacherController.removeProfilePic)
// router.delete("/:code/leave-meeting",jwtVerify, teacherController.leaveMeetingTeacher)

module.exports = router;
