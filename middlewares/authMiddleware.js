const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    //    console.log("hehe");
    const token = req.headers["authorization"].split("Bearer ")[1];
    // console.log(token);
    jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      } else {
        req.body.userId = decoded.id;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};

module.exports = authMiddleware;
