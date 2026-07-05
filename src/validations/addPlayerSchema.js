import Joi from "joi";

const addPlayerFields = Joi.object({
  firstname: Joi.string()
    .pattern(/^[a-zA-Z]+/)
    .min(2)
    .max(15)
    .required(),
  lastname: Joi.string()
    .pattern(/^[a-zA-Z]+/)
    .min(2)
    .max(15)
    .required(),
  age: Joi.number().integer().min(18).max(120).required(),
  gender: Joi.string().valid("male", "female").required(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9\s-()]{7,15}$/)
    .required(),
  email: Joi.string().email().required(),
  partner: Joi.string().allow("", null).optional(),
  duprRating: Joi.number().min(0).max(8).precision(2).optional(),
  duprId: Joi.string().allow("", null).optional(),
  clubName: Joi.string().max(120).allow("", null).optional(),
  teamId: Joi.number().integer().positive().allow(null).optional(),
  paymentStatus: Joi.string().valid("paid", "unpaid", "refunded").optional(),
  sendPaymentEmail: Joi.boolean().optional(),
});

const addPlayerValidation = async (req, res, next) => {
  try {
    const data = req.body.data || req.body;
    const { error } = addPlayerFields.validate(data, { convert: true });

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