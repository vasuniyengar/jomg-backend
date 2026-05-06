import Joi from "joi";

const addPlayerValidation = async (req, res, next) => {
  try {
    const { data } = req.body;
    const addPlayerSchema = Joi.object({
      firstname: Joi.string()
        .pattern(/^[a-zA-Z]+/)
        .min(3)
        .max(15)
        .required()
        .messages({
          "string.pattern.base":
            "firstname should contain only letters.spaces and numbers are not allowed.",
          "any.required": "firstname must be required",
          "string.min": "firstname should be atleast 3 characters",
          "string.max": "firstname cannot be more than  15 characters",
          "string.empty": "firstname must be required",
        }),
      lastname: Joi.string()
        .pattern(/^[a-zA-Z]+/)
        .min(3)
        .max(15)
        .required()
        .messages({
          "string.pattern.base":
            "lastname should contain only letters.spaces and numbers are not allowed.",
          "any.required": "lastname must be required",
          "string.min": "lastname should must be atleast 3 characters",
          "string.max": "lastname cannot be more than 15 characters",
          "string.empty": "lastname must be required",
        }),
      age: Joi.number().integer().min(18).max(120).required().messages({
        "number.base": "Age must be number",
        "any.required": "age must be required",
        "number.min": "Age should be 18 or greater",
        "number.max": "Age should be 120 or less",
        "number.empty": "Age must be required",
      }),
      gender: Joi.string().valid("male", "female").required().messages({
        "any.only": "Gender either be male or female",
        "any.required": "Gender must be required",
        "any.empty": "Gender must be required",
      }),
      phoneNumber: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,15}$/)
        .required()
        .messages({
          "string.pattern.base":
            "Must be a valid phone number (e.g., +1 (555) 123-4567 or +91 9876543210)",
          "string.empty": "phone number must be required",
          "any.required": "phone number must be required",
        }),
      email: Joi.string().email().required().messages({
        "string.email": "enter valid email address",
        "string.empty": "email must be required",
        "any.required": "email must be required",
      }),
    });

    const { error } = addPlayerSchema.validate(data, { convert: true });

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

export default { addPlayerValidation };
