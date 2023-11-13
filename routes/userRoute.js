const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Doctor = require("../models/doctorModel");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const userModel = require("../models/userModel");
const moment = require("moment");

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    // console.log(userExists);
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newuser = new User(req.body);
    await newuser.save();
    res
      .status(200)
      .send({ message: "user created successfully", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error in creating User", success: false, error });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(401).send({
        success: false,
        message: "please fill all the fields",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "user not registered",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    // const isMatch =password==user.password;
    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid password or username",
      });
    }
    const token = jwt.sign({ id: user._id }, `${process.env.JWT_SECRET}`, {
      expiresIn: "1d",
    });

    return res.status(200).send({
      success: true,
      message: "login successfully",
      data: token,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).send({
      success: false,
      message: "error in login callback",
      error,
    });
  }
});


router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    // console.log("hehe");
    const user = await User.findById({ _id: req.body.userId });
    // console.log(user);
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ message: "user does not exist", success: false });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "error  in getting user info", success: false, error });
  }
});


router.post("/apply-doctor-account", authMiddleware, async (req, res) => {
  // console.log("hehe");

  try {
    const newdoctor = new Doctor({ ...req.body, status: "pending" });
    await newdoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `${newdoctor.firstName}  ${newdoctor.lastName} has applied for a doctor account`,
      data: {
        doctorId: newdoctor._id,
        name: newdoctor.firstName + " " + newdoctor.lastName,
      },
      onClickPath: "/admin/doctors",
    });
    await User.findByIdAndUpdate(adminUser._id,{unseenNotifications});
    res.status(200).send({
      success: true,
      message: "Doctor account applied successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
        message: "Error in  applying  doctor account",
        success: false,
        error,
      });
  }
});


router.post("/mark-all-notifications-as-seen",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });
      //   const  unseenNotifications=user.unseenNotifications;
      //   user.seenNotifications= unseenNotifications;

      //   user.unseenNotifications=[];
      //   const updatedUser=await user.findByIdAndUpdate(user._id,user)
      //   updatedUser.password=undefined;

      const seenNotifications = user.seenNotifications;
      const unseenNotifications = user.unseenNotifications;
      seenNotifications.push(...unseenNotifications);
      user.unseenNotifications = [];
      user.seenNotifications = seenNotifications;
      const updatedUser = await user.save();
      res.status(200).send({
        success: true,
        message: "All notifications marked as seen",
        data: updatedUser,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send({
          message: "Error in  marking all notifications as seen",
          success: false,
          error,
        });
    }
  }
);


router.post("/delete-all-notifications", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    user.seenNotifications = [];
    user.unseenNotifications = [];
    const updatedUser = await user.save();

    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: "All notifications are deleted",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({
        message: "unable to  delete all notifications",
        success: false,
        error,
      });
  }
});

// get all doctor
router.get("/getAllDoctors", authMiddleware, async (req, res) => {
  // console.log('Hehe');
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Doctor lists fetched successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in getting all doctors",
    });
  }
});

// book appointment
router.post("/book-appointment",authMiddleware, async (req, res) => {
     console.log(req.body);
    //  console.log(req.body.time);
    try 
    {
      // req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
      // req.body.time = moment(req.body.time,"HH:mm").toISOString();
      // console.log(date)
      req.body.status = "pending";
      const newAppointment = new appointmentModel(req.body);
      await newAppointment.save();
      console.log(newAppointment);
      const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });

          //  pushing notification to doctor by his userid 

      user.unseenNotifications.push({
        type: "New-appointment-request",
        message: `A new Appointment Request from ${req.body.userInfo.name}`,
        onCLickPath: "/user/appointments",
      });
      await user.save();
      res.status(200).send({
        success: true,
        message: "Appointment request send  successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        error,
        message: "Error While sending  Appointment request ",
      });
    }
  }
);

// checking availability
router.post("/booking-availbility", authMiddleware, async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm").subtract(1, "hour").toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hour").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        message: "Appointment available ",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in booking availability",
      error,
    });
  }
});


router.get('/user-appointments',authMiddleware, async(req,res)=>{
    try {
        const appointments= await appointmentModel.find({userId:req.body.userId})
        res.status(200).send({
            success:true,
            message:`user appointment fetched successfully`,
            data:appointments

        })
    } catch (error) {
        
        console.log(error);
        res.status(500).send({
            success:false,
            error,
            message:'Error in User Appointments'
        })
    }
})

module.exports = router;
