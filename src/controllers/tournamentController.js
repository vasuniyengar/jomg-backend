import models from "../models/Associations.js";

import slugify from "slugify";

import { Op } from "sequelize";

import sequelize from "../config/database.js";

// import s3Client from "../config/s3Client.js";

// import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// import { SendMessageCommand } from "@aws-sdk/client-sqs";

// import sqsClient from "../config/sqsClient.js";

const {
  Tournament,
  Club,
  Bracket,
  Group,
  Format,
  BracketFormat,
  ScoringList,
  User,
  Event,
  PlayoffSeeding,
  PlayerRegistration,
} = models;

const S3_BASE_URL =
  process.env.AWS_S3_BASE_URL ||
  "https://s3.us-east-1.amazonaws.com/pb-images-storage/";

const extractS3KeyFromUrl = (fullUrl) => {
  if (!fullUrl || typeof fullUrl !== "string") return null;

  // If the URL starts with the known base path, strip it off
  if (fullUrl.startsWith(S3_BASE_URL)) {
    return fullUrl.substring(S3_BASE_URL.length);
  }
  // If it doesn't look like a full URL, assume it's already the keyz
  return fullUrl;
};

const createTournament = async (req, res) => {
  const t = await sequelize.transaction();
  let s3FileKey = null;
  try {
    // console.log("file", req.file);
    // console.log("req body", req.body);
    const {
      clubId,
      name,
      description,
      entryFee,
      discount,
      location,
      status,
      startDate,
      endDate,
      registrationOpenDate,
      registrationCloseDate,
      organizerInfo,
      // bracketName,
      // groupId,
      // formatId,
      // bracketFormatId,
      // maxTeams,
      // scoringListId,
      // playoffMatchId,
      // goldMatchId,
      // bronzeMatchId,
      // semiFinalMatchId,
      // playoffSeedingId,
      // roundMatchId,
    } = req.body;

    // console.log(status);

    // if (req.file) {
    //   s3FileKey = `${Date.now()}-${req.file.originalname.replace(/\s+g/, "_")}`;
    //   const command = new PutObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: s3FileKey,
    //     Body: req.file.buffer,
    //     ContentType: req.file.mimetype,
    //   });
    //   await s3Client.send(command);
    // }

    //Check if club exists
    const club = await Club.findOne({
      where: { id: clubId, hostId: req.user.id },
      transaction: t,
    });

    if (!club) {
      await t.rollback();
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Please create a club before creating a tournament",
      });
    }

    const slug = slugify(name, { lower: true, locale: "en", strict: true });

    // Check if tournament exists
    let tournament = await Tournament.findOne({
      where: {
        hostId: req.user.id,
        clubId,
        slug,
      },
      transaction: t,
    });

    if (tournament) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament name should be unique",
      });
    }

    // Fetch required references
    // const group = await Group.findByPk(groupId, { transaction: t });

    // const format = await Format.findByPk(formatId, { transaction: t });

    // const bracketFormat = await BracketFormat.findByPk(bracketFormatId, {
    //   transaction: t,
    // });
    // const scoringList = await ScoringList.findByPk(scoringListId, {
    //   transaction: t,
    // });
    // const playoffSeedings = await PlayoffSeeding.findByPk(playoffSeedingId, {
    //   transaction: t,
    // });

    // if (
    //   !group ||
    //   !format ||
    //   !bracketFormat ||
    //   !scoringList ||
    //   !playoffSeedings
    // ) {
    //   await t.rollback();
    //   return res.status(404).json({
    //     code: 404,
    //     error: true,
    //     message:
    //       "group, format, bracketFormat, scoringList, or playoffSeeding not found",
    //   });
    // }

    // // Determine event
    // const eventName = `${group.name} ${format.name}`;
    // let event = await Event.findOne({ where: { eventName }, transaction: t });
    // if (!event) {
    //   event = await Event.create({ eventName }, { transaction: t });
    // }

    // Check if bracket already exists under this tournament & event
    // if (tournament) {
    //   const existingBracket = await Bracket.findOne({
    //     where: {
    //       name: bracketName,
    //       tournamentId: tournament.id,
    //       eventId: event.id,
    //       bracketFormatId,
    //       bronzeMatchId,
    //       goldMatchId,
    //       scoringListId,
    //       semiFinalMatchId,
    //       playoffSeedingId,
    //       roundId: roundMatchId,
    //       maxTeams: maxTeams ?? 0,
    //       formatId,
    //       groupId,
    //       playoffMatchId,
    //       minAge: 0,
    //       maxAge: 0,
    //       minRating: 0,
    //       maxRating: 0,
    //     },
    //     transaction: t,
    //   });

    //   if (existingBracket) {
    //     await t.rollback();
    //     return res.status(400).json({
    //       code: 400,
    //       error: true,
    //       message:
    //         "Tournament with this bracket already exists! Try another name.",
    //     });
    //   }
    // }

    // If tournament does not exist, create it
    if (!tournament) {
      const slug = slugify(name, { lower: true, locale: "en", strict: true });
      tournament = await Tournament.create(
        {
          clubId,
          name,
          description,
          entryFee,
          discount,
          location,
          startDate,
          endDate,
          registrationOpenDate,
          registrationCloseDate,
          tournamentTumbnail: s3FileKey,
          status,
          slug,
          organizerInfo,
          hostId: req.user.id,
        },
        { transaction: t }
      );
    }

    // // Create new bracket
    // const newBracket = await Bracket.create(
    //   {
    //     tournamentId: tournament.id,
    //     name: bracketName,
    //     maxTeams,
    //     eventId: event.id,
    //     bracketFormatId,
    //     scoringListId,
    //     playoffSeedingId,
    //     playoffMatchId,
    //     semiFinalMatchId,
    //     bronzeMatchId,
    //     goldMatchId,
    //     roundId: roundMatchId,
    //   },
    //   { transaction: t }
    // );

    await t.commit();

    return res.status(200).json({
      code: 200,
      message: "Tournament  created",
      data: {
        tournamentId: tournament.id,
        message: "your tournament is created successfully",
        // bracketData: newBracket,
        // eventData: event,
      },
    });
  } catch (error) {
    console.log(error.message);
    // if (s3FileKey) {
    //   const deleteCommand = new DeleteObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: s3FileKey,
    //   });
    //   await s3Client.send(deleteCommand);
    // }
    await t.rollback();
    return res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
      details: error.errors,
    });
  }
};

const getAllTournamentsOfHost = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { status, search } = req.query;

    const where = { hostId };
    if (status) where.status = status;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const tournaments = await Tournament.findAll({
      where,
      include: [
        {
          model: Bracket,
          include: [{ model: Event }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Loop over tournaments and brackets to calculate registration info
    for (const tournament of tournaments) {
      for (const bracket of tournament.Brackets) {
        const eventName = bracket.Event?.eventName?.toLowerCase() || "";

        // Determine players per team
        let playersPerTeam = 1;
        if (eventName.includes("double")) playersPerTeam = 2;
        if (eventName.includes("mixed")) playersPerTeam = 2;

        // Count registered players
        const totalPlayersRegistered = await PlayerRegistration.count({
          where: { bracketId: bracket.id },
        });

        // Calculate total capacity
        const totalCapacityOfPlayers = bracket.maxTeams * playersPerTeam;

        // Attach new fields to bracket object
        bracket.dataValues.totalPlayersRegistered = totalPlayersRegistered;
        bracket.dataValues.totalCapacityOfPlayers = totalCapacityOfPlayers;
      }
    }

    const finalData = tournaments.map((t) => t.toJSON());

    res.status(200).json({
      code: 200,
      error: false,
      message: "Tournaments created by host with registration info",
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const getAllTournamentsOfStatusActive = async (req, res) => {
  try {
    const { location, startDate, eventId } = req.query;
    // console.log(location), console.log(startDate);
    // console.log(eventId);
    // console.log(status);
    const where = {};
    where.status = "active";

    const now = new Date();

    where.registrationCloseDate = { [Op.gte]: now };

    where.endDate = { [Op.gte]: now };

    if (location) where.location = { [Op.like]: `%${location}%` };

    if (startDate && startDate.trim() !== "") {
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0); // 00:00:00

      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999); // 23:59:59

      where.startDate = {
        [Op.between]: [dayStart, dayEnd],
      };
    }

    const tournaments = await Tournament.findAll({
      where,
      include: [
        {
          model: Bracket,
          ...(eventId && { where: { eventId: eventId } }),
          include: [{ model: Event }],
        },
      ],
      limit: 6,
      order: [["createdAt", "DESC"]],
    });
    // {
    //   console.log(tournaments);
    // }

    const finalData = tournaments.map((t) => t.toJSON());
    res.status(200).json({
      code: 200,
      error: false,
      message: "tournaments",
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const getAllTournaments = async (req, res) => {
  try {
    const { location, startDate, eventId, search, sort } = req.query;
    const where = {};
    // console.log(location);
    // console.log(startDate);
    // console.log(eventId);
    // console.log(search);
    // console.log(sort);

    if (location) where.location = { [Op.like]: `%${location}%` };

    if (search) where.name = { [Op.like]: `%${search}%` };

    where.registrationCloseDate = { [Op.gt]: new Date() };

    where.status = { [Op.in]: ["active"] };

    if (startDate && startDate.trim() !== "") {
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0); // 00:00:00

      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999); // 23:59:59

      where.startDate = {
        [Op.between]: [dayStart, dayEnd],
      };
    }

    let order = [["createdAt", "DESC"]];
    if (sort === "newest") {
      order.push(["createdAt", "DESC"]);
    } else if (sort === "oldest") {
      order.push(["createdAt", "ASC"]);
    } else if (sort === "trending") {
      order = [
        [
          sequelize.literal(`(
      SELECT COUNT(*) 
      FROM Brackets AS b
      WHERE b.tournamentId = Tournament.id
    )`),
          "DESC",
        ],
      ];
    }

    const tournaments = await Tournament.findAll({
      where,
      include: [
        {
          model: Bracket,
          ...(eventId && { where: { eventId: eventId } }),
          include: [{ model: Event }],
        },
      ],
      order,
    });

    const finalData = tournaments.map((t) => t.toJSON());

    res.status(200).json({
      code: 200,
      error: false,
      message: "tournaments",
      data: finalData,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const getTournamentAndBracketDataByTournamentId = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId },
      include: [
        {
          // Include all brackets for this tournament
          model: Bracket,
          include: [
            {
              model: Event,
              attributes: ["eventName"],
            },
            {
              model: BracketFormat,
              attributes: ["name"],
            },
            {
              model: ScoringList,
              attributes: ["name"],
            },
          ],
        },
        {
          // Include the parent club information
          model: Club,
          attributes: ["id", "name"], // Send only the ID and name
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Tournament not found",
      });
    }
    // The tournament.tournamentTumbnail will be a full S3 URL thanks to the getter
    return res.status(200).json({
      error: false,
      code: 200,
      data: tournament.toJSON(), // This single object now contains tournament, brackets, and club
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    // console.log(tournamentId);
    const tournament = await Tournament.findOne({
      where: { id: tournamentId },
      include: [
        { model: User, attributes: ["id", "firstname", "lastname", "email"] },
        // {
        //   model: Bracket,
        //   include: [{ model: Event }, { model: PlayoffSeeding }],
        // },
      ],
    });

    if (!tournament) {
      return res.status(400).json({
        code: 400,
        error: false,
        message: "tournament not found!",
        data: tournament,
      });
    }

    res.status(200).json({
      code: 200,
      error: false,
      message: "tournaments",
      data: tournament.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const getTournamentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const tournament = await Tournament.findOne({
      where: { slug: slug },
      attributes: { include: ["tournamentTumbnail"] },
      raw: false,
      include: [
        { model: User, attributes: ["id", "firstname", "lastname", "email"] },
        {
          model: Bracket,
          include: [{ model: Event }, { model: PlayoffSeeding }],
        },
      ],
    });

    if (!tournament) {
      return res.status(400).json({
        code: 400,
        error: false,
        message: "tournament not found!",
      });
    }

    res.status(200).json({
      code: 200,
      error: false,
      message: "tournament data successfully fetched",
      data: tournament.get({ plain: true }),
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const updatingTournamentById = async (req, res) => {
  const t = await sequelize.transaction();
  const { tournamentId } = req.params;
  const hostId = req.user.id;
  let oldS3KeyForDeletion = null;
  let newS3KeyToStore = null;
  try {
    const {
      // bracketId,
      // bracketname,
      // playoffSeedingId,
      // playoffMatchId,
      // semiFinalMatchId,
      // roundMatchId,
      // goldMatchId,
      // bracketFormatId,
      // formatId,
      // bronzeMatchId,
      // groupId,
      ...tournamentPayload
    } = req.body;

    const tournament = await Tournament.findOne({
      where: {
        id: tournamentId,
        hostId: hostId,
      },
      transaction: t,
    });

    if (!tournament) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Tournament not found and you are not authorized to edit it.",
      });
    }

    if (["ongoing", "completed"].includes(tournament.status)) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message:
          "Tournament completed or ongoing.Not have access to edit Tournament.",
      });
    }

    // if (!bracketId) {
    //   await t.rollback();
    //   return res.status(400).json({
    //     error: true,
    //     code: 400,
    //     message: "bracketId is required to edit bracket",
    //   });
    // }

    // const bracket = await Bracket.findByPk(bracketId, { transaction: t });

    // if (!bracket || bracket.tournamentId !== tournament.id) {
    //   await t.rollback();
    //   return res.status(400).json({
    //     error: true,
    //     code: 400,
    //     message: "Bracket not found!",
    //   });
    // }

    // if (
    //   bracket.isPoolStarted ||
    //   ["ongoing", "completed"].includes(bracket.status)
    // ) {
    //   await t.rollback();

    //   return res.status(404).json({
    //     error: true,
    //     code: 404,
    //     message: "Bracket ongoing or completed.Not has access to edit bracket.",
    //   });
    // }

    oldS3KeyForDeletion = extractS3KeyFromUrl(tournament.tournamentTumbnail);

    // console.log(oldS3KeyForDeletion);

    if (req.file) {
      // AWS/S3 upload disabled for local non-AWS setup.
      newS3KeyToStore = tournamentPayload.tournamentTumbnail;
    } else {
      newS3KeyToStore = tournamentPayload.tournamentTumbnail;
    }

    const updatePayload = {
      ...tournamentPayload,
      ...(newS3KeyToStore !== undefined && {
        tournamentTumbnail: newS3KeyToStore,
      }),
    };

    if (updatePayload.name && updatePayload.name !== tournament.name) {
      updatePayload.slug = slugify(updatePayload.name, {
        locale: "en",
        lower: true,
        strict: true,
      });
    } else {
      delete updatePayload.slug;
    }

    await tournament.update(updatePayload, {
      transaction: t,
    });

    // const group = await Group.findByPk(groupId, { transaction: t });

    // const format = await Format.findByPk(formatId, { transaction: t });

    // if (!group || !format) {
    //   await t.rollback();
    //   return res.status(400).json({
    //     error: true,
    //     code: 400,
    //     message: "group and formant is not found!",
    //   });
    // }

    // const eventName = `${group.name} ${format.name}`;

    // let event = await Event.findOne(
    //   {
    //     where: { eventName: eventName },
    //   },
    //   { transaction: t }
    // );

    // if (!event) {
    //   event = await Event.create({ eventName: eventName }, { transaction: t });
    // }

    // const bracketPayload = {
    //   name: bracketname,
    //   roundId: roundMatchId,
    //   bracketFormatId,
    //   groupId,
    //   formatId,
    //   playoffSeedingId,
    //   playoffMatchId,
    //   semiFinalMatchId,
    //   goldMatchId,
    //   bronzeMatchId,
    //   eventId: event.id,
    // };

    // await bracket.update(
    //   { ...bracketPayload, eventId: event.id },
    //   { transaction: t }
    // );

    await t.commit();

    // if (
    //   req.file &&
    //   oldS3KeyForDeletion &&
    //   newS3KeyToStore !== oldS3KeyForDeletion
    // ) {
    //   const deleteCommand = new DeleteObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: oldS3KeyForDeletion,
    //   });
    //   await s3Client.send(deleteCommand);
    // }

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Tournament updated successfully",
      tournamentData: tournament.toJSON(),
      // bracketData: bracket.toJSON(),
      // eventName: eventName,
    });
  } catch (error) {
    await t.rollback();

    // if (req.file && newS3KeyToStore) {
    //   const deleteCommand = new DeleteObjectCommand({
    //     Bucket: process.env.AWS_BUCKET_NAME,
    //     Key: newS3KeyToStore,
    //   });
    //   await s3Client.send(deleteCommand);
    // }

    res.status(500).json({
      error: true,
      message: error.message,
      code: 500,
    });
  }
};

const invitePlayers = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { emails, registrationLink } = req.body;
    const hostUserId = req.user.id;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "Email list is required." });
    }
    if (!registrationLink) {
      return res
        .status(400)
        .json({ message: "Registration link is required." });
    }

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: "Tournament not found." });
    }

    // Optional: Check if the user is the host
    // if (tournament.hostId !== hostUserId) { // Assuming you have hostId
    //   return res.status(403).json({ message: "Forbidden: Not the host." });
    // }

    // Check tournament status (Adapt 'status' field and values to your model)
    const allowedStatuses = ["ongoing", "completed"]; // Example statuses
    if (!allowedStatuses.includes(tournament.status)) {
      return res.status(400).json({
        message: `Cannot invite players. Tournament status is '${tournament.status}'.`,
      });
    }

    // Optional: Check if tournament is full (Adapt to your logic)
    // const currentPlayers = await PlayerRegistration.count({ where: { tournamentId } });
    // if (tournament.maxPlayers && currentPlayers >= tournament.maxPlayers) {
    //   return res.status(400).json({ message: "Tournament is full." });
    // }

    //  Send SQS Jobs
    const host = await User.findByPk(hostUserId); // Get host details for email
    const hostName = host
      ? `${host.firstname} ${host.lastname}`
      : "The Tournament Host";

    let jobsSentCount = 0;
    for (const email of emails) {
      if (typeof email === "string" && email.includes("@")) {
        // const sqsJob = {
        //   jobType: "tournamentInvitation",
        //   email: email,
        //   hostName: hostName,
        //   tournamentName: tournament.name,
        //   registrationLink: registrationLink,
        // };
        // const command = new SendMessageCommand({
        //   QueueUrl: process.env.EMAIL_QUEUE_URL,
        //   MessageBody: JSON.stringify(sqsJob),
        // });
        // sqsClient.send(command).catch((err) => {
        //   // console.error(`[API] Failed to send invite job for ${email}:`, err);
        // });
        jobsSentCount++;
      }
    }

    // --- Respond to Frontend ---
    res.status(200).json({
      message: `Sending ${jobsSentCount} invitation(s)...`,
    });
  } catch (error) {
    // console.error("[API] Error in invitePlayers:", error);
    res
      .status(500)
      .json({ message: "Internal server error during invitation." });
  }
};

// const getBracketsOfTournament = async (req, res) => {
//   try {
//     const { tournamentId } = req.params;

//     const tournament = await Tournament.findByPk(tournamentId);

//     if (!tournament) {
//       return res.status(400).json({
//         error: true,
//         code: 400,
//         message: "tournament doesnt found!",
//       });
//     }

//     const brackets = await Bracket.findAll({
//       where: {
//         tournamentId,
//       },
//     });

//     if (!brackets.length) {
//       return res.status(404).json({
//         error: true,
//         code: 404,
//         message: "tournament doesnt have brackets",
//         data: [],
//       });
//     }

//     res.status(200).json({
//       error: false,
//       code: 200,
//       data: brackets,
//       message: "brackets fetched",
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: message.error,
//       code: 500,
//       error: true,
//     });
//   }
// };

export default {
  createTournament,
  getAllTournamentsOfHost,
  getAllTournamentsOfStatusActive,
  getAllTournaments,
  getTournamentById,
  getTournamentBySlug,
  updatingTournamentById,
  getTournamentAndBracketDataByTournamentId,
  invitePlayers,
};
