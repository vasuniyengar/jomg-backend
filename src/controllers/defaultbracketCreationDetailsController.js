import bracketModels from "../models/Associations.js";

const { Format, Group, BracketFormat, ScoringList, PlayoffSeeding } =
  bracketModels;

const defaultBracketCreationDetails = async (req, res) => {
  try {
    const groups = await Group.findAll({ attributes: ["id", "name"] });
    const formats = await Format.findAll({ attributes: ["id", "name"] });
    const bracketFormats = await BracketFormat.findAll({
      attributes: ["id", "name", "description", "status"],
    });
    const scoringLists = await ScoringList.findAll({
      attributes: ["id", "name"],
    });
    const playoffSeedings = await PlayoffSeeding.findAll({
      attributes: ["id", "name", "description", "status"],
    });
    const responseData = {
      groups,
      formats,
      bracket_formats: bracketFormats,
      scoring_lists: scoringLists,
      playoff_seeding: playoffSeedings,
    };
    res.status(200).json({
      error: false,
      data: responseData,
      message: "successfully fetched",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

export default { defaultBracketCreationDetails };
