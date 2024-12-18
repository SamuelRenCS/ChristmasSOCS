const { userSchema } = require("./schemas");

// define the middleware to validate the user registration input
module.exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    return res.status(400).json({ message });
  } else {
    next();
  }
};
