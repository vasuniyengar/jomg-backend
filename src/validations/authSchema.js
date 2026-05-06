import Joi from "joi";

const signinSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Must be a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

const signinValidation = (req, res, next) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: error.details[0].message,
      });
    }
    return next();
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default { signinValidation };
