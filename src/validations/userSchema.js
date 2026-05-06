import Joi from "joi";

const nameSchema = Joi.string()
  .pattern(/^[a-zA-Z]+$/)
  .min(3)
  .max(30)
  .required();

const userSignupValidation = (req, res, next) => {
  try {
    const userData = req.body;
    const userSignupSchema = Joi.object({
      firstname: nameSchema.messages({
        "string.pattern.base":
          "Firstname can only contain letters.No spaces or numbers  allowed",
        "string.empty": "Firstname is required",
        "string.min": "Firstname must be at least 3 characters",
        "string.max": "Firstname cannot be more than 30 characters",
        "any.required": "Firstname is required",
      }),
      lastname: nameSchema.messages({
        "string.pattern.base":
          "Lastname can only contain letters.No spaces or numbers allowed",
        "string.empty": "Lastname is required",
        "string.min": "Lastname must be at least 3 characters",
        "string.max": "Lastname cannot be more than 30 characters",
        "any.required": "Lastname is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Must be a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),
      age: Joi.number().integer().min(18).max(120).required().messages({
        "number.base": "Age must be a number",
        "number.min": "Age must be 18 or greater",
        "number.max": "Age must be 120 or less",
        "any.required": "Age is required",
      }),
      gender: Joi.string().valid("male", "female").required().messages({
        "any.only": "Gender must be either 'male' or 'female'",
        "any.required": "Gender is required",
      }),
      password: Joi.string()
        .pattern(
          new RegExp("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,30}$")
        )
        .required()
        .messages({
          "string.pattern.base":
            "Password must be 8-30 characters and include at least one letter and one number",
          "string.empty": "Password is required",
          "any.required": "Password is required",
        }),
      role: Joi.string().required().messages({
        "string.empty": "Role is required",
        "any.required": "Role is required",
      }),
      phoneNumber: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,20}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Must be a valid phone number (e.g., +1 (555) 123-4567 or +91 9876543210)",
          "string.empty": "Phone number is required",
          "any.required": "Phone number is required",
        }),
    });

    const { error } = userSignupSchema.validate(userData);

    if (error) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: error.details[0].message,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const userLoginValidation = (req, res, next) => {
  try {
    const userData = req.body;

    const userLoginSchema = Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Must be a valid email address",
        "string.empty": "Email is required",
        "any.required": "Email is required",
      }),
      password: Joi.string().required().messages({
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
      role: Joi.string().required().messages({
        "string.empty": "Role is required",
        "any.required": "Role is required",
      }),
    });

    const { error } = userLoginSchema.validate(userData);
    if (error) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: error.details[0].message,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default { userSignupValidation, userLoginValidation };
