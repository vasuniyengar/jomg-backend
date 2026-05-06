import models from "../models/Associations.js";

import { Op } from "sequelize";

const { PlayerRegistration, Tournament, Bracket, Event } = models;

const getPlayerTournaments = async (req, res) => {
  try {
    const playerId = req.user.id;

    const { search, status } = req.query;
    const where = {};
    // console.log(location);
    // console.log(startDate);
    // console.log(eventId);
    // console.log(search);
    // console.log(sort);
    // console.log(status);
    // console.log(search);

    if (search) where.name = { [Op.like]: `%${search}%` };

    let registrationWhere = { playerId };

    if (status && status !== "all") {
      registrationWhere.status = status;
    }

    const registrations = await PlayerRegistration.findAll({
      where: registrationWhere,
      include: [
        {
          model: Tournament,
          where,
        },
        {
          model: Bracket,
          include: [{ model: Event }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!registrations.length) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "No tournament registrations found for this player",
        data: [],
      });
    }

    const tournaments = await Promise.all(
      registrations.map(async (reg) => {
        // Count number of players already registered for this bracket
        const registeredCount = await PlayerRegistration.count({
          where: { bracketId: reg.Bracket.id },
        });

        // Calculate capacity: bracket.format * bracket.maxTeams
        // Example: "singles" = 1 player per team, "doubles" = 2, etc.
        let playersPerTeam = 1;
        const format = reg.Bracket.Event.eventName.toLowerCase();
        if (format.includes("single")) playersPerTeam = 1;
        else if (format.includes("double")) playersPerTeam = 2;
        else if (format.includes("triple")) playersPerTeam = 3;

        const capacity = reg.Bracket.maxTeams;

        const teams = Math.ceil(registeredCount / playersPerTeam);

        return {
          registrationId: reg.id,
          tournamentId: reg.Tournament.id,
          tournamentName: reg.Tournament.name,
          description: reg.Tournament.description,
          startDate: reg.Tournament.startDate,
          tournamentTumbnail: reg.Tournament.tournamentTumbnail,
          endDate: reg.Tournament.endDate,
          location: reg.Tournament.location,
          entryFee: reg.Tournament.entryFee,
          bracketId: reg.Bracket.id,
          bracketName: reg.Bracket.name,
          format: reg.Bracket.format,
          minAge: reg.Bracket.minAge,
          maxAge: reg.Bracket.maxAge,
          event: reg.Bracket.Event ? reg.Bracket.Event.event : null,
          registrationStatus: reg.status,
          paymentStatus: reg.paymentStatus,
          registeredPlayers: registeredCount,
          teams,
          capacity,
        };
      })
    );
    res.status(200).json({
      error: false,
      code: 200,
      message: "Tournaments fetched successfully",
      data: tournaments,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const recentlyPlayersTournaments = async (req, res) => {
  try {
    const playerId = req.user.id;

    const limit = 3;
    const offset = 0;

    const { count, rows: registrations } =
      await PlayerRegistration.findAndCountAll({
        where: { playerId },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          { model: Tournament, required: true },

          {
            model: Bracket,
            include: [
              {
                model: Event,
              },
            ],
          },
        ],
      });

    if (!registrations.length) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "No tournament registrations for player",
        data: [],
      });
    }

    const tournamentsData = registrations.map((reg) => {
      return {
        tournamentStartDate: reg.Tournament.startDate,
        tournamentEndDate: reg.Tournament.endDate,
        tournamentLocation: reg.Tournament.location,
        tournamentName: reg.Tournament.name,
        registartionStatus: reg.status,
      };
    });

    res.status(200).json({
      error: false,
      code: 200,
      message: "registrated tournament data fetched",
      data: tournamentsData,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default { getPlayerTournaments, recentlyPlayersTournaments };
