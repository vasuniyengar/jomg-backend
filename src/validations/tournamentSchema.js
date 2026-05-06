import Joi from "joi";

const tournamentCreateValidation = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Tournament thumbnail is required",
      });
    }

    const data = req.body;

    const createSchema = Joi.object({
      name: Joi.string().min(3).max(100).required().messages({
        "string.base": "Tournament name should be text",
        "string.empty": "Tournament name is required",
        "string.min": "Tournament name must have at least 3 characters",
      }),
      description: Joi.string().min(10).max(2000).required().messages({
        "string.base": "Description should be text",
        "string.empty": "Description is required",
        "string.min": "Description must have at least 10 characters",
      }),
      entryFee: Joi.number().precision(2).min(0).required().messages({
        "number.base": "Entry fee must be a number",
        "number.min": "Entry fee cannot be negative",
        "any.required": "Entry fee is required",
      }),
      clubId: Joi.number().integer().required().messages({
        "number.base": "Club ID must be a number",
        "any.required": "Club ID is required",
      }),
      discount: Joi.number().precision(2).min(0).max(100).required().messages({
        "number.base": "Discount must be a number",
        "number.min": "Discount cannot be negative",
        "number.max": "Discount cannot exceed 100%",
        "any.required": "Discount is required",
      }),
      location: Joi.string().min(3).max(255).required().messages({
        "string.base": "Location should be text",
        "string.empty": "Location is required",
      }),
      startDate: Joi.date().iso().required().messages({
        "date.base": "Start date must be a valid date",
        "date.iso": "Start date must be a valid ISO datetime",
        "any.required": "Start date is required",
      }),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
        "date.base": "End date must be a valid date",
        "date.iso": "End date must be a valid ISO datetime",
        "date.min": "End date must be on or after start date",
        "any.required": "End date is required",
      }),
      registrationOpenDate: Joi.date()
        .iso()
        .less(Joi.ref("startDate"))
        .required()
        .messages({
          "date.base": "Registration open date must be a valid date",
          "date.iso": "Registration open date must be a valid ISO datetime",
          "date.less":
            "Registration open date must be before the tournament start date",
          "any.required": "Registration open date is required",
        }),
      registrationCloseDate: Joi.date()
        .iso()
        .min(Joi.ref("registrationOpenDate"))
        .less(Joi.ref("startDate"))
        .required()
        .messages({
          "date.base": "Registration close date must be a valid date",
          "date.iso": "Registration close date must be a valid ISO datetime",
          "date.min":
            "Registration close date must be on or after registration open date",
          "date.less":
            "Registration close date must be *before* the tournament start date",
          "any.required": "Registration close date is required",
        }),
      status: Joi.string()
        .valid("draft", "active", "completed")
        .required()
        .messages({
          "any.only": "Status must be one of: draft, active, completed",
          "any.required": "Status is required",
        }),
      organizerInfo: Joi.string().required().messages({
        "string.base": "organizer info must be string",
        "any.required": "organizer info must be required",
      }),
      // bracketName: Joi.string().min(3).max(100).required().messages({
      //   "string.base": "Bracket name should be text",
      //   "string.empty": "Bracket name is required",
      //   "string.min": "Bracket name must have at least 3 characters",
      // }),
      // groupId: Joi.number().integer().required(),
      // formatId: Joi.number().integer().required(),
      // bracketFormatId: Joi.number().integer().required(),
      // maxTeams: Joi.number().integer().min(1).max(100).required(),
      // scoringListId: Joi.number().integer().required(),
      // playoffMatchId: Joi.number().integer().required(),
      // goldMatchId: Joi.number().integer().required(),
      // bronzeMatchId: Joi.number().integer().required(),
      // semiFinalMatchId: Joi.number().integer().required(),
      // playoffSeedingId: Joi.number().integer().required(),
      // roundMatchId: Joi.number().integer().required(),
    });

    const { error, value } = createSchema.validate(data, { convert: true });
    if (error) {
      console.log(error.details[0].message);
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
    if (!req.file && !req.body.tournamentTumbnail) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Tournament thumbnail is required",
      });
    }

    const data = req.body;

    const createSchema = Joi.object({
      name: Joi.string().min(3).max(100).required().messages({
        "string.base": "Tournament name should be text",
        "string.empty": "Tournament name is required",
        "string.min": "Tournament name must have at least 3 characters",
      }),
      description: Joi.string().min(10).max(2000).required().messages({
        "string.base": "Description should be text",
        "string.empty": "Description is required",
        "string.min": "Description must have at least 10 characters",
      }),
      entryFee: Joi.number().precision(2).min(0).required().messages({
        "number.base": "Entry fee must be a number",
        "number.min": "Entry fee cannot be negative",
        "any.required": "Entry fee is required",
      }),
      clubId: Joi.number().integer().required().messages({
        "number.base": "Club ID must be a number",
        "any.required": "Club ID is required",
      }),
      discount: Joi.number().precision(2).min(0).max(100).required().messages({
        "number.base": "Discount must be a number",
        "number.min": "Discount cannot be negative",
        "number.max": "Discount cannot exceed 100%",
        "any.required": "Discount is required",
      }),
      location: Joi.string().min(3).max(255).required().messages({
        "string.base": "Location should be text",
        "string.empty": "Location is required",
      }),
      startDate: Joi.date().iso().required().messages({
        "date.base": "Start date must be a valid date",
        "date.iso": "Start date must be a valid ISO datetime",
        "any.required": "Start date is required",
      }),
      endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
        "date.base": "End date must be a valid date",
        "date.iso": "End date must be a valid ISO datetime",
        "date.min": "End date must be on or after start date",
        "any.required": "End date is required",
      }),
      registrationOpenDate: Joi.date()
        .iso()
        .less(Joi.ref("startDate"))
        .required()
        .messages({
          "date.base": "Registration open date must be a valid date",
          "date.iso": "Registration open date must be a valid ISO datetime",
          "date.less":
            "Registration open date must be before the tournament start date",
          "any.required": "Registration open date is required",
        }),
      registrationCloseDate: Joi.date()
        .iso()
        .min(Joi.ref("registrationOpenDate"))
        .less(Joi.ref("startDate"))
        .required()
        .messages({
          "date.base": "Registration close date must be a valid date",
          "date.iso": "Registration close date must be a valid ISO datetime",
          "date.min":
            "Registration close date must be on or after registration open date",
          "date.less":
            "Registration close date must be *before* the tournament start date",
          "any.required": "Registration close date is required",
        }),
      status: Joi.string()
        .valid("draft", "active", "completed")
        .required()
        .messages({
          "any.only": "Status must be one of: draft, active, completed",
          "any.required": "Status is required",
        }),
      organizerInfo: Joi.string().required().messages({
        "string.base": "organizer info must be string",
        "any.required": "organizer info must be required",
      }),
      slug: Joi.string().required().messages({
        "string.base": "slug  must be string",
        "any.required": "slug must be required",
      }),
      tournamentTumbnail: Joi.string().uri().optional().messages({
        "string.base": "Thumbnail must be a string",
        "string.uri": "Thumbnail must be a valid URL",
      }),
      // bracketName: Joi.string().min(3).max(100).required().messages({
      //   "string.base": "Bracket name should be text",
      //   "string.empty": "Bracket name is required",
      //   "string.min": "Bracket name must have at least 3 characters",
      // }),
      // groupId: Joi.number().integer().required(),
      // formatId: Joi.number().integer().required(),
      // bracketFormatId: Joi.number().integer().required(),
      // maxTeams: Joi.number().integer().min(1).max(100).required(),
      // scoringListId: Joi.number().integer().required(),
      // playoffMatchId: Joi.number().integer().required(),
      // goldMatchId: Joi.number().integer().required(),
      // bronzeMatchId: Joi.number().integer().required(),
      // semiFinalMatchId: Joi.number().integer().required(),
      // playoffSeedingId: Joi.number().integer().required(),
      // roundMatchId: Joi.number().integer().required(),
    });

    const { error, value } = createSchema.validate(data, { convert: true });
    if (error) {
      console.log(error.details[0].message);
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

export default { tournamentCreateValidation, tournamentUpdateValidation };
