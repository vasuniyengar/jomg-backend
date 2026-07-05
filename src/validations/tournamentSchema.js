import Joi from "joi";

const organizerInfoSchema = Joi.alternatives().try(
  Joi.object({
    name: Joi.string().min(1).max(255).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow("", null).optional(),
  })
    .unknown(true)
    .max(50000),
  Joi.string().min(1).max(50000)
);

const dateField = (label) =>
  Joi.date().iso().required().messages({
    "date.base": `${label} must be a valid date`,
    "date.iso": `${label} must be a valid ISO datetime`,
    "any.required": `${label} is required`,
  });

const optionalDateField = (label) =>
  Joi.date().iso().allow(null, "").optional().messages({
    "date.base": `${label} must be a valid date`,
    "date.iso": `${label} must be a valid ISO datetime`,
  });

const tournamentCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Tournament name should be text",
    "string.empty": "Tournament name is required",
    "string.min": "Tournament name must have at least 3 characters",
  }),
  description: Joi.string().min(1).max(20000).required().messages({
    "string.base": "Description should be text",
    "string.empty": "Description is required",
  }),
  entryFee: Joi.number().precision(2).min(0).default(0),
  clubId: Joi.number().integer().required().messages({
    "number.base": "Club ID must be a number",
    "any.required": "Club ID is required",
  }),
  discount: Joi.number().integer().min(0).max(100).default(0),
  venue: Joi.string().max(255).allow("", null).optional(),
  location: Joi.string().min(3).max(255).required().messages({
    "string.base": "Location should be text",
    "string.empty": "Location is required",
  }),
  timezone: Joi.string().max(100).allow("", null).optional(),
  startDate: dateField("Start date"),
  endDate: Joi.date()
    .iso()
    .min(Joi.ref("startDate"))
    .required()
    .messages({
      "date.base": "End date must be a valid date",
      "date.min": "End date must be on or after start date",
      "any.required": "End date is required",
    }),
  registrationOpenDate: Joi.date()
    .iso()
    .less(Joi.ref("startDate"))
    .required()
    .messages({
      "date.base": "Registration open date must be a valid date",
      "date.less":
        "Registration open date must be before the tournament start date",
      "any.required": "Registration open date is required",
    }),
  registrationCloseDate: Joi.date()
    .iso()
    .min(Joi.ref("registrationOpenDate"))
    .max(Joi.ref("endDate"))
    .required()
    .messages({
      "date.base": "Registration close date must be a valid date",
      "date.min":
        "Registration close date must be on or after registration open date",
      "date.max":
        "Registration close date must be on or before the tournament end date",
      "any.required": "Registration close date is required",
    }),
  refundDeadline: optionalDateField("Refund deadline"),
  refundFee: Joi.number().precision(2).min(0).default(0),
  duprRecorded: Joi.boolean().default(true),
  duprEnforced: Joi.boolean().default(false),
  requireSkillRating: Joi.boolean().default(false),
  status: Joi.string()
    .valid("draft", "active", "ongoing", "completed")
    .default("draft"),
  organizerInfo: organizerInfoSchema.required(),
  slug: Joi.string()
    .min(3)
    .max(120)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
});

const tournamentCreateValidation = (req, res, next) => {
  try {
    const { error, value } = tournamentCreateSchema.validate(req.body, {
      convert: true,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: error.details[0].message,
      });
    }

    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      code: 500,
      error: true,
      message: err.message,
    });
  }
};

const tournamentUpdateValidation = (req, res, next) => {
  try {
    const updateSchema = tournamentCreateSchema
      .fork(
        [
          "name",
          "description",
          "entryFee",
          "clubId",
          "discount",
          "venue",
          "location",
          "timezone",
          "startDate",
          "endDate",
          "registrationOpenDate",
          "registrationCloseDate",
          "refundDeadline",
          "refundFee",
          "duprRecorded",
          "duprEnforced",
          "requireSkillRating",
          "status",
          "organizerInfo",
          "slug",
        ],
        (field) => field.optional()
      )
      .keys({
        tournamentTumbnail: Joi.string().uri().allow("", null).optional().messages({
          "string.uri": "Thumbnail must be a valid URL",
        }),
      })
      .or(
        "name",
        "description",
        "entryFee",
        "clubId",
        "discount",
        "venue",
        "location",
        "timezone",
        "startDate",
        "endDate",
        "registrationOpenDate",
        "registrationCloseDate",
        "refundDeadline",
        "refundFee",
        "duprRecorded",
        "duprEnforced",
        "requireSkillRating",
        "status",
        "organizerInfo",
        "slug",
        "tournamentTumbnail"
      )
      .min(1);

    const { error, value } = updateSchema.validate(req.body, {
      convert: true,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: error.details[0].message,
      });
    }

    req.body = value;
    next();
  } catch (err) {
    return res.status(500).json({
      code: 500,
      error: true,
      message: err.message,
    });
  }
};

const statusPatchSchema = Joi.object({
  status: Joi.string()
    .valid("draft", "active", "ongoing", "completed")
    .required(),
});

const settingsPushSchema = Joi.object({
  sections: Joi.array()
    .items(Joi.string().valid("pricing", "playRules", "dupr"))
    .min(1)
    .required(),
  bracketIds: Joi.array().items(Joi.number().integer().positive()).optional(),
});

const statusPatchValidation = (req, res, next) => {
  const { error } = statusPatchSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      code: 400,
      error: true,
      message: error.details[0].message,
    });
  }
  next();
};

const settingsPushValidation = (req, res, next) => {
  const { error } = settingsPushSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({
      code: 400,
      error: true,
      message: error.details[0].message,
    });
  }
  next();
};

export default {
  tournamentCreateValidation,
  tournamentUpdateValidation,
  statusPatchValidation,
  settingsPushValidation,
};
