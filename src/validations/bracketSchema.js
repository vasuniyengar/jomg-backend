import Joi from "joi";
import moodels from "../models/Associations.js";

const { Tournament } = moodels;

const bracketValidation = async (req, res, next) => {
  try {
    const data = req.body;

    const { tournamentId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Tournament not found",
      });
    }

    const createSchema = Joi.object({
      bracketName: Joi.string().min(3).max(100).required().messages({
        "string.base": "Bracket name should be text",
        "string.empty": "Bracket name is required",
        "string.min": "Bracket name must have at least 3 characters",
        "any.required": "Bracket name is required",
      }),
      groupId: Joi.number().integer().required().messages({
        "number.base": "Group ID must be a number",
        "any.required": "Group ID is required",
      }),
      formatId: Joi.number().integer().required().messages({
        "number.base": "Format ID must be a number",
        "any.required": "Format ID is required",
      }),
      bracketFormatId: Joi.number().integer().required().empty("").messages({
        "number.base": "Bracket Format ID must be a number",
        "any.required": "Bracket Format ID is required",
        "number.empty": "Bracket Format ID cannot be empty",
      }),
      maxTeams: Joi.number().integer().min(1).max(100).required().messages({
        "number.base": "Max teams must be a number",
        "number.min": "Max teams must be at least 1",
        "any.required": "Max teams is required",
      }),
      scoringListId: Joi.number().integer().required().messages({
        "number.base": "Scoring List ID must be a number",
        "any.required": "Scoring List ID is required",
      }),
      playoffMatchId: Joi.number().integer().required().messages({
        "number.base": "Playoff Match ID must be a number",
        "any.required": "Playoff Match ID is required",
      }),
      goldMatchId: Joi.number().integer().required().messages({
        "number.base": "Gold Match ID must be a number",
        "any.required": "Gold Match ID is required",
      }),
      bronzeMatchId: Joi.number().integer().required().messages({
        "number.base": "Bronze Match ID must be a number",
        "any.required": "Bronze Match ID is required",
      }),
      semiFinalMatchId: Joi.number().integer().required().messages({
        "number.base": "Semi-Final Match ID must be a number",
        "any.required": "Semi-Final Match ID is required",
      }),
      playoffSeedingId: Joi.number().integer().required().messages({
        "number.base": "Playoff Seeding ID must be a number",
        "any.required": "Playoff Seeding ID is required",
      }),
      roundMatchId: Joi.number().integer().required().messages({
        "number.base": "Round Match ID must be a number",
        "any.required": "Round Match ID is required",
      }),
      status: Joi.string()
        .valid("draft", "active", "ongoing", "completed")
        .required()
        .messages({
          "any.only": "Status must be one of: draft, active,ongoing,completed",
          "any.required": "Status is required",
        }),
      registrationFee: Joi.number().precision(2).min(0).required().messages({
        "number.base": "Registration fee must be a number",
        "number.min": "Registration fee cannot be negative",
        "any.required": "Registration fee is required",
      }),
      startDate: Joi.date()
        .iso()
        .min(tournament.startDate) // cannot start before tournament
        .max(tournament.endDate) // cannot start after tournament ends
        .required()
        .messages({
          "date.base": "Start date must be a valid date",
          "date.iso": "Start date must be ISO format",
          "date.min":
            "Bracket start date cannot be before tournament start date",
          "date.max": "Bracket start date cannot be after tournament end date",
        }),
      endDate: Joi.date()
        .iso()
        .min(Joi.ref("startDate")) // cannot end before bracket start
        .max(tournament.endDate) // cannot end after tournament ends
        .required()
        .messages({
          "date.base": "End date must be a valid date",
          "date.iso": "End date must be ISO format",
          "date.min": "Bracket end date cannot be before bracket start date",
          "date.max": "Bracket end date cannot be after tournament end date",
        }),
    });
    const { error, value } = createSchema.validate(data, {
      convert: true,
    });

    if (error) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: error.details[0].message,
      });
    }

    req.body = value;
    next();
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default { bracketValidation };
