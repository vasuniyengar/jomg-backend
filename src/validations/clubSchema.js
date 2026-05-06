import Joi from "joi";

const clubUpdateValidation = (req, res, next) => {
  try {
    const clubData = req.body;

    const clubSchema = Joi.object({
      name: Joi.string().min(3).max(100).required().messages({
        "string.base": "Club name should be text",
        "string.min": "Club name must have at least 3 characters",
        "any.required": "Club name is required",
      }),

      location: Joi.string().min(3).max(255).required().messages({
        "string.base": "Location should be text",
        "string.min": "Location must have at least 3 characters",
        "any.required": "Location is required",
      }),

      phoneNumber: Joi.string()
        .pattern(/^\+?[0-9\s-()]{7,25}$/)
        .required()
        .messages({
          "string.pattern.base": "Phone number format is invalid",
          "any.required": "Phone number is required",
          "string.empty": "Phone number cannot be empty",
        }),

      clubType: Joi.string().min(3).max(50).required().messages({
        "string.base": "Club type should be text",
        "string.min": "Club type must have at least 3 characters",
        "any.required": "Club type is required",
      }),
      description: Joi.string()
        .min(10)
        .max(1000)
        .optional()
        .allow(null, "")
        .messages({
          "string.base": "Description should be text",
          "string.min": "Description must have at least 10 characters",
        }),
    }).min(1);

    const { error } = clubSchema.validate(clubData, { abortEarly: false });
    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({
        code: 400,
        error: true,
        message: errorMessages,
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      code: 500,
      error: true,
      message: err.message,
    });
  }
};

export default { clubUpdateValidation };
