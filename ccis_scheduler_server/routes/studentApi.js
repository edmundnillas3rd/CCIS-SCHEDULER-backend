const express = require("express")
const router = express.Router();
const studentController = require('../controllers/student')
const jwtVerify = require("../middleware/verifyJWT")
const verifyCode = require("../middleware/verifyCode")
const multer = require("multer")
const {storage} = require("../services/cloudinary");
const upload = multer({storage})
//get
router.get("/profile", jwtVerify, studentController.studentProfile)
router.get("/all-teachers", studentController.allTeacher)
router.get("/all-venues", studentController.allVenues)
router.get("/available-meetings",jwtVerify, studentController.availableMeeting)
router.get("/pending-meetings/creator",jwtVerify, studentController.creatorPendingMeetings)
router.get("/my-meetings/creator",jwtVerify, studentController.creatorMyMeetings)
router.get("/my-meetings/participant",jwtVerify ,studentController.participantMyMeetings)
router.get("/my-archive-meetings/creator", jwtVerify, studentController.creatorArchiveMeetings)
router.get("/my-archive-meetings/participant",jwtVerify ,studentController.participantArchiveMeetings)
router.get("/:code/view-meeting/creator", jwtVerify, studentController.creatorViewMeeting)
router.get("/:code/view-meeting/participant", jwtVerify, studentController.participantViewMeetings)
router.get("/:code/view-archive-meeting/creator", jwtVerify, studentController.creatorViewArchiveMeeting)
router.get("/:code/view-archive-meeting/participant", jwtVerify, studentController.participantViewArchiveMeetings)

//post
router.post("/login", studentController.login)  
router.post("/signup", studentController.signup)
router.post("/confirm-credentials", jwtVerify, studentController.confirmCredentials)
router.post("/create-meeting",jwtVerify, studentController.createMeeting)
router.post("/:code/join", jwtVerify, studentController.joinMeeting)
router.post("/verify-signup/:id/:verify_token", studentController.verifySignup)

//patch
router.patch("/signout", jwtVerify, studentController.updateStatusIfSignOut)
router.patch("/update-profile", jwtVerify, studentController.updateProfile)
router.patch("/update-profile-pic", jwtVerify, upload.single("image"), studentController.updateProfilePic)
router.patch("/update-username", verifyCode,  studentController.updateUsername)
router.patch("/update-password", verifyCode,  studentController.updatePassword)
router.patch("/:code/update-pending-meeting", jwtVerify, studentController.updatePendingMeeting)
router.patch("/:code/archive-meeting", jwtVerify, studentController.archiveMeeting)
router.patch("/:code/to-private", jwtVerify, studentController.updateMeetingViewsPrivate)
router.patch("/:code/to-public", jwtVerify, studentController.updateMeetingViewsPublic)

//delete
router.delete("/:filename/remove-profile-pic",jwtVerify, studentController.removeProfilePic)
router.delete("/:code/delete-meeting/creator",jwtVerify, studentController.deleteMeetingCreator)
router.delete("/:code/leave-meeting/participant",jwtVerify, studentController.leaveMeetingParticipants)



module.exports = router;