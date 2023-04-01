const express = require("express")
const router = express.Router();
const adminController = require("../controllers/admin")
const jwtVerify = require("../middleware/verifyJWT")
const verifyCode = require('../middleware/verifyCode')
//GET
router.get("/profile",jwtVerify, adminController.adminProfile)
router.get("/all-students",jwtVerify, adminController.allStudent)
router.get("/all-teachers",jwtVerify, adminController.allTeacher)
router.get("/all-venues",jwtVerify, adminController.allVenues)
router.get("/team-members",jwtVerify, adminController.teamMembers)
router.get("/list-of-meetings",jwtVerify, adminController.listOfMeeting)
router.get("/list-of-archive-meetings",jwtVerify, adminController.listOfArchiveMeeting)
router.get("/:code/view-meeting",jwtVerify, adminController.adminViewMeeting)
router.get("/:code/view-archive-meeting",jwtVerify, adminController.adminViewMeeting)
//POST
router.post("/login", adminController.login)
router.post("/signup", adminController.signUpAdmin)
router.post("/add-teacher",jwtVerify, adminController.addTeacher)
router.post("/add-venue",jwtVerify, adminController.addVenue)
router.post("/confirm-credentials",jwtVerify, adminController.confirmCredentials)
router.post("/:id/:email/add-sub-admin",jwtVerify, adminController.addSubAdmins)
//PATCH
router.patch("/update-profile",jwtVerify, adminController.updateProfile)
router.patch("/update-username",verifyCode, adminController.updateUsername)
router.patch("/update-password",verifyCode, adminController.updatePassword)
//DELETE
router.delete("/students/:id",jwtVerify, adminController.removeStudent);
router.delete("/teachers/:id",jwtVerify, adminController.removeTeacher)
router.delete("/venues/:id",jwtVerify, adminController.removeVenue)
router.delete("/sub-admin/:id",jwtVerify, adminController.removeSubAdmins)


module.exports = router;