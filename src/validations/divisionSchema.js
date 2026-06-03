import Joi from "joi";

const divisionBodySchema = Joi.object({
  bracketName: Joi.string().trim().min(1).max(120).required(),
  groupId: Joi.number().integer().positive().required(),
  formatId: Joi.number().integer().positive().required(),
  bracketFormatId: Joi.number().integer().positive().required(),
  maxTeams: Joi.number().integer().min(2).max(512).required(),
  registrationFee: Joi.number().min(0).optional(),
  minAge: Joi.number().integer().min(0).max(120).optional(),
  maxAge: Joi.number().integer().min(0).max(120).optional(),
  minRating: Joi.number().min(0).max(8).precision(2).optional(),
  maxRating: Joi.number().min(0).max(8).precision(2).optional(),
  startDate: Joi.string().allow("", null).optional(),
  endDate: Joi.string().allow("", null).optional(),
  status: Joi.string().valid("draft", "active", "ongoing", "completed").optional(),
});

export const validateCreateDivision = (req, res, next) => {
  const { error } = divisionBodySchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ code: 400, error: true, message: error.details[0].message });
  }
  next();
};

export const validateUpdateDivision = validateCreateDivision;

const paymentPatchSchema = Joi.object({
  paymentStatus: Joi.string().valid("paid", "unpaid", "refunded").required(),
  syncPartner: Joi.boolean().optional(),
});

export const validatePaymentPatch = (req, res, next) => {
  const { error } = paymentPatchSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ code: 400, error: true, message: error.details[0].message });
  }
  next();
};

const bulkPaymentSchema = Joi.object({
  registrationIds: Joi.array().items(Joi.number().integer().positive()).min(1).required(),
  paymentStatus: Joi.string().valid("paid", "unpaid", "refunded").required(),
  syncPartner: Joi.boolean().optional(),
});

export const validateBulkPaymentPatch = (req, res, next) => {
  const { error } = bulkPaymentSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ code: 400, error: true, message: error.details[0].message });
  }
  next();
};
