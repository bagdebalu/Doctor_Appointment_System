const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const userModel = require("../models/userModel");
const doctorModel = require("../models/doctorModel");
const router = express.Router();

router.get("/getAllUsers", authMiddleware, async (req, res) => {
  try {
    // console.log("hehe");
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "Users data list ",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting all users",
      success: false,
      error,
    });
  }
});

router.get("/getAllDoctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors data list ",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "error in getting all doctors",
      success: false,
      error,
    });
  }
});

router.post("/changeAccountStatus", authMiddleware, async (req, res) => {
  try {
    const { doctorId, status } = req.body;
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
    const user = await userModel.findOne({ _id: doctor.userId });

    const unseenNotifications = user.unseenNotifications;
    unseenNotifications.push({
      type: "doctor-account-request-updated",
      message: `Your Doctor Account request has been ${status}`,
      onClickPath: "/notifications",
    });
    user.isDoctor = status === "approved" ? true : false;
    await user.save();
    res.status(201).send({
      success: true,
      message: "Account Status Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in getting all doctors",
      success: false,
      error,
    });
  }
});

module.exports = router;
