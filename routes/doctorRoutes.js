const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const doctorModel = require("../models/doctorModel");
const appointmentModel=require("../models/appointmentModel");
const userModel = require("../models/userModel");

const router = express.Router();

// get single doc info router

router.post("/getDoctorInfo",authMiddleware, async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: " doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching Doctors details",
    });
  }
});

router.post("/updateProfile",authMiddleware, async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(201).send({
      success: true,
      message: "Doctor profile updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in updating doctor profile",
      error,
    });
  }
});

router.post("/getDoctorById",authMiddleware, async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "single Doctor  info fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error in getting  single doctor ",
      error,
    });
  }
});

router.get('/doctor-appointments',authMiddleware,async(req,res)=>{
   try {
    const doctor=await doctorModel.findOne({userId:req.body.userId});
    // console.log(doctor);
       const appointments=await appointmentModel.find({ doctorId:doctor._id})
       res.status(200).send({
        success:true,
        message:"Doctor Appointment fetched Successfully",
        data:appointments,
       })
   } catch (error) {
    console.log(error);
    res.status(500).send({
      success:true,
      message:'Error in fetching doctor appointments'
    })
    
   }
})

router.post('/update-status',authMiddleware, async(req,res)=>{
  try {
    const{appointmentsId,status} =req.body;
    const appointments= await appointmentModel.findByIdAndUpdate(appointmentsId,{status})
    const user = await userModel.findOne({ _id: appointments.userId});
    const unseenNotifications=user.unseenNotifications;
    unseenNotifications.push({
      type: "Updated",
      message: `your appointment has been ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();
    res.status(200).send({
      success:true,
      message:'Appointment status Updated',

    })
  } catch (error) {
    
    console.log(error)
    res.status(500).send({
      success:false,
      error,
      message:"error in  upadating status"
    })
  }
})

module.exports = router;
