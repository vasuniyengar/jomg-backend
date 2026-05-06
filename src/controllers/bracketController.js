import models from "../models/Associations.js";

const {
  Bracket,
  Tournament,
  Group,
  Format,
  BracketFormat,
  ScoringList,
  PlayoffSeeding,
  Event,
} = models;

const createBracket = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const {
      bracketName,
      groupId,
      formatId,
      bracketFormatId,
      maxTeams,
      scoringListId,
      playoffMatchId,
      goldMatchId,
      bronzeMatchId,
      semiFinalMatchId,
      playoffSeedingId,
      roundMatchId,
      startDate,
      endDate,
      status,
      registrationFee,
    } = req.body;

    // Check tournament
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Tournament not found!",
      });
    }

    tournament.status = status;
    await tournament.save();

    // Validate dependent models
    const [group, format, bracketFormat, scoringList, playoffSeedings] =
      await Promise.all([
        Group.findByPk(groupId),
        Format.findByPk(formatId),
        BracketFormat.findByPk(bracketFormatId),
        ScoringList.findByPk(scoringListId),
        PlayoffSeeding.findByPk(playoffSeedingId),
      ]);

    if (
      !group ||
      !format ||
      !bracketFormat ||
      !scoringList ||
      !playoffSeedings
    ) {
      return res.status(404).json({
        code: 404,
        error: true,
        message:
          "Group, Format, BracketFormat, ScoringList, or PlayoffSeeding not found.",
      });
    }

    // Find or create Event
    const eventName = `${group.name} ${format.name}`;
    let event = await Event.findOne({ where: { eventName } });
    if (!event) {
      event = await Event.create({ eventName });
    }

    // Check duplicate bracket (simplified)
    const existingBracket = await Bracket.findOne({
      where: {
        name: bracketName,
        tournamentId: tournament.id,
        eventId: event.id,
      },
    });

    if (existingBracket) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "A bracket with this name already exists in the tournament.",
      });
    }

    // Create new Bracket
    const newBracket = await Bracket.create({
      tournamentId: tournament.id,
      name: bracketName,
      maxTeams,
      eventId: event.id,
      bracketFormatId,
      scoringListId,
      playoffSeedingId,
      playoffMatchId,
      semiFinalMatchId,
      bronzeMatchId,
      goldMatchId,
      roundId: roundMatchId,
      minAge: 0,
      maxAge: 0,
      minRating: 0,
      maxRating: 0,
      status,
      startDate,
      endDate,
      registrationFee,
    });

    return res.status(201).json({
      code: 201,
      error: false,
      message: "Bracket created successfully!",
      data: {
        tournamentData: tournament,
        bracketData: newBracket,
        eventData: event,
      },
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const gettingAllBracketsOfTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const hostId = req.user.id;
    const tournament = await Tournament.findByPk(tournamentId, {
      where: {
        hostId,
      },
    });
    if (!tournament) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "tournament not found",
      });
    }

    const brackets = await Bracket.findAll({
      where: {
        tournamentId: tournamentId,
      },
      attributes: ["id", "name"],
    });

    if (!brackets.length) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "brackets are not present for this tournament",
        data: [],
      });
    }

    res.status(200).json({
      error: false,
      message: "brackets fetched successfully",
      code: 200,
      data: brackets,
    });
  } catch (error) {
    res.status(500).json({ code: 500, error: true, message: error.message });
  }
};

const updatingBracket = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    const {
      groupId,
      formatId,
      bracketFormatId,
      playoffMatchId,
      playoffSeedingId,
      semiFinalMatchId,
      roundMatchId,
      scoringListId,
      goldMatchId,
      bronzeMatchId,
      bracketName,
      maxTeams,
      status,
      startDate,
      endDate,
      registrationFee,
    } = req.body;

    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament not found!",
      });
    }

    const bracket = await Bracket.findOne({
      where: {
        id: bracketId,
        tournamentId,
      },
      include: [
        {
          model: Event,
          attributes: ["id", "eventName"],
        },
      ],
    });

    if (
      !bracket ||
      bracket.isPoolStarted ||
      ["ongoing", "completed"].includes(bracket.status)
    ) {
      return res.status(400).json({
        error: true,
        code: 400,
        message:
          "bracket not found or bracket pools started or bracket is ongoing or completed",
      });
    }

    const group = await Group.findByPk(groupId);

    const format = await Format.findByPk(formatId);

    const playoffSeedings = await PlayoffSeeding.findByPk(playoffSeedingId);

    const bracketFormat = await BracketFormat.findByPk(bracketFormatId);

    const scoring = await ScoringList.findByPk(scoringListId);

    if (!group || !format || !playoffSeedings || !bracketFormat || !scoring) {
      return res.status(400).json({
        error: true,
        code: 400,
        message:
          "bracket or format or playoffseeding or bracketformat or scoring not found!",
      });
    }

    const newEventName = `${group.name} ${format.name}`;

    const [event, createdEvent] = await Event.findOrCreate({
      where: { eventName: newEventName },
    });

    tournament.status = status;
    await tournament.save();

    const updatedBracket = await bracket.update({
      name: bracketName,
      playoffSeedingId,
      bracketFormatId,
      playoffMatchId,
      semiFinalMatchId,
      goldMatchId,
      bronzeMatchId,
      roundId: roundMatchId,
      eventId: event.id,
      maxTeams,
      status,
      startDate,
      endDate,
      registrationFee,
    });

    res.status(200).json({
      error: false,
      code: 200,
      message: "Bracket updated successfully!",
      data: {
        tournamentData: tournament,
        bracketData: updatedBracket,
        eventData: event,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const getBracketById = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) {
      return res.status(400).json({
        error: "true",
        code: 400,
        message: "tournament not found!",
      });
    }

    const bracket = await Bracket.findOne({
      where: {
        id: bracketId,
        tournamentId,
      },
      include: [
        {
          model: Event,
        },
      ],
    });

    if (!bracket) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "bracket not found!",
      });
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "bracket fetched",
      bracketData: bracket,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default {
  createBracket,
  gettingAllBracketsOfTournament,
  updatingBracket,
  getBracketById,
};
