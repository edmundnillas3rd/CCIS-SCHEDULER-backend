const express = require("express")
const router = express.Router();
const subaAdminController = require("../controllers/subadmin")
const jwtVerify = require("../middleware/verifyJWT")
//GET
router.get("/profile",jwtVerify, subaAdminController.subAdminProfile)
router.get("/all-students",jwtVerify, subaAdminController.allStudent)
router.get("/all-teachers",jwtVerify, subaAdminController.allTeacher)
router.get("/all-venues",jwtVerify, subaAdminController.allVenues)
router.get("/team-members",jwtVerify, subaAdminController.teamMembers)
router.get("/list-of-meetings",jwtVerify, subaAdminController.listOfMeeting)
router.get("/list-of-archive-meetings",jwtVerify, subaAdminController.listOfArchiveMeeting)
router.get("/:code/view-meeting",jwtVerify, subaAdminController.subAdminViewMeeting)
router.get("/:code/view-archive-meeting",jwtVerify, subaAdminController.subAdminViewArchiveMeeting)
//POST
router.post("/login", subaAdminController.login)
router.post("/add-teacher",jwtVerify, subaAdminController.addTeacher)
router.post("/add-venue",jwtVerify, subaAdminController.addVenue)
//DELETE
router.delete("/students/:id",jwtVerify, subaAdminController.removeStudent)
router.delete("/teachers/:id",jwtVerify, subaAdminController.removeTeacher)
router.delete("/venues/:id",jwtVerify, subaAdminController.removeVenue)


module.exports = router;