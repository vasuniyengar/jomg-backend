import models from "../models/Associations.js";

import slugify from "slugify";

import { Op } from "sequelize";

import sequelize from "../config/database.js";

import {
  computeHubStatus,
  hubStatusSortOrder,
  serializeOrganizerInfo,
  parseOrganizerInfo,
  parseTournamentSettings,
  canTransitionStatus,
  displayStatusLabel,
  canStartTournamentLive,
} from "../utils/tournamentHub.js";
import { pushPlayRulesToDivisions } from "../utils/pushPlayRulesToDivisions.js";
import { pushPricingToDivisions } from "../utils/pushPricingToDivisions.js";

import {
  uploadTournamentImage,
  deleteTournamentImage,
  extractMediaKey,
} from "../services/tournamentMediaService.js";

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

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const resolveSlug = (name, customSlug) => {
  if (customSlug && String(customSlug).trim()) {
    return slugify(String(customSlug).trim(), {
      lower: true,
      locale: "en",
      strict: true,
    });
  }
  return slugify(name, { lower: true, locale: "en", strict: true });
};

const enrichBracketRegistrationStats = async (bracket) => {
  const eventName = bracket.Event?.eventName?.toLowerCase() || "";
  let playersPerTeam = 1;
  if (eventName.includes("double")) playersPerTeam = 2;
  if (eventName.includes("mixed")) playersPerTeam = 2;

  const totalPlayersRegistered = await PlayerRegistration.count({
    where: { bracketId: bracket.id },
  });
  const totalCapacityOfPlayers = bracket.maxTeams * playersPerTeam;

  bracket.dataValues.totalPlayersRegistered = totalPlayersRegistered;
  bracket.dataValues.totalCapacityOfPlayers = totalCapacityOfPlayers;
  return totalPlayersRegistered;
};

const mapTournamentListItem = async (tournament) => {
  let players = 0;
  for (const bracket of tournament.Brackets || []) {
    players += await enrichBracketRegistrationStats(bracket);
  }

  const paidCount = await PlayerRegistration.count({
    where: {
      tournamentId: tournament.id,
      paymentStatus: "paid",
    },
  });

  const entryFee = Number(tournament.entryFee || 0);
  const revenue = Math.round(paidCount * entryFee);

  const json = tournament.toJSON();
  const hubStatus = computeHubStatus(json);

  return {
    ...json,
    hubStatus,
    players,
    revenue,
    divisions: (tournament.Brackets || []).length,
    banner: json.tournamentTumbnail || null,
    organizer: parseOrganizerInfo(json.organizerInfo),
  };
};

const createTournament = async (req, res) => {
  const t = await sequelize.transaction();
  let s3FileKey = null;
  try {
    const {
      clubId,
      name,
      description,
      entryFee = 0,
      discount = 0,
      venue,
      location,
      timezone,
      status = "draft",
      startDate,
      endDate,
      registrationOpenDate,
      registrationCloseDate,
      refundDeadline,
      refundFee = 0,
      duprRecorded = true,
      duprEnforced = false,
      requireSkillRating = false,
      organizerInfo,
      slug: slugInput,
    } = req.body;

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

    const slug = resolveSlug(name, slugInput);

    const existing = await Tournament.findOne({
      where: { slug },
      transaction: t,
    });

    if (existing) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Tournament URL slug is already in use",
      });
    }

    const tournament = await Tournament.create(
      {
        clubId,
        name,
        description,
        entryFee,
        discount,
        venue: venue || null,
        location,
        timezone: timezone || null,
        startDate,
        endDate,
        registrationOpenDate,
        registrationCloseDate,
        refundDeadline: refundDeadline || null,
        refundFee,
        duprRecorded,
        duprEnforced,
        requireSkillRating,
        tournamentTumbnail: s3FileKey,
        status,
        slug,
        organizerInfo: serializeOrganizerInfo(organizerInfo),
        hostId: req.user.id,
      },
      { transaction: t }
    );

    await t.commit();

    const plain = tournament.toJSON();
    plain.organizer = parseOrganizerInfo(plain.organizerInfo);
    plain.hubStatus = computeHubStatus(plain);
    plain.players = 0;
    plain.revenue = 0;
    plain.divisions = 0;
    plain.banner = plain.tournamentTumbnail || null;

    return res.status(201).json({
      code: 201,
      error: false,
      message: "Tournament created",
      data: plain,
    });
  } catch (error) {
    console.log(error.message);
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
    const { status: hubStatusFilter, search } = req.query;

    const where = { hostId };
    const today = startOfToday();
    const todayStr = today.toISOString().slice(0, 10);

    if (hubStatusFilter === "draft") {
      where.status = "draft";
    } else if (hubStatusFilter === "completed") {
      where.status = "completed";
    } else if (hubStatusFilter === "active") {
      where[Op.or] = [
        { status: "ongoing" },
        {
          status: "active",
          startDate: { [Op.lte]: todayStr },
        },
      ];
    } else if (hubStatusFilter === "upcoming") {
      where.status = "active";
      where.startDate = { [Op.gt]: todayStr };
    }

    if (search) {
      where[Op.and] = [
        ...(where[Op.and] || []),
        {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { location: { [Op.iLike]: `%${search}%` } },
            { venue: { [Op.iLike]: `%${search}%` } },
          ],
        },
      ];
    }

    const tournaments = await Tournament.findAll({
      where,
      include: [
        { model: Club, attributes: ["id", "name", "location", "phoneNumber"] },
        { model: Bracket, include: [{ model: Event }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    let finalData = await Promise.all(
      tournaments.map((row) => mapTournamentListItem(row))
    );

    if (
      hubStatusFilter &&
      ["active", "upcoming", "draft", "completed"].includes(hubStatusFilter)
    ) {
      finalData = finalData.filter((row) => row.hubStatus === hubStatusFilter);
    }

    finalData.sort(
      (a, b) => hubStatusSortOrder(a.hubStatus) - hubStatusSortOrder(b.hubStatus)
    );

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

    const finalData = tournaments
      .map((t) => t.toJSON())
      .filter((t) => {
        const { settings } = parseTournamentSettings(t.organizerInfo);
        const vis = settings?.visibility || {};
        if (vis.privateOnly) return false;
        if (vis.publicTournamentPage === false) return false;
        return true;
      });

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
        { model: Club, attributes: ["id", "name"] },
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

    const plain = tournament.toJSON();
    plain.clubName = plain.Club?.name || null;

    res.status(200).json({
      code: 200,
      error: false,
      message: "tournaments",
      data: plain,
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

    if (updatePayload.organizerInfo !== undefined) {
      updatePayload.organizerInfo = serializeOrganizerInfo(
        updatePayload.organizerInfo
      );
      const { settings } = parseTournamentSettings(updatePayload.organizerInfo);
      if (
        settings.settingsConfirmed === false &&
        tournament.status === "active"
      ) {
        updatePayload.status = "draft";
      }
    }

    if (updatePayload.slug !== undefined && updatePayload.slug !== tournament.slug) {
      const nextSlug = resolveSlug(tournament.name, updatePayload.slug);
      const taken = await Tournament.findOne({
        where: { slug: nextSlug, id: { [Op.ne]: tournament.id } },
        transaction: t,
      });
      if (taken) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "Tournament URL slug is already in use",
        });
      }
      updatePayload.slug = nextSlug;
    } else if (updatePayload.name && updatePayload.name !== tournament.name) {
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

    let divisionsScoringUpdated = 0;
    let divisionsPricingUpdated = 0;
    const organizerInfoForPush =
      updatePayload.organizerInfo ?? tournament.organizerInfo;
    try {
      const pushResult = await pushPlayRulesToDivisions(
        tournamentId,
        organizerInfoForPush
      );
      divisionsScoringUpdated = pushResult.updated;
    } catch (pushErr) {
      console.warn("[Tournament] pushPlayRulesToDivisions:", pushErr.message);
    }
    try {
      const pricingResult = await pushPricingToDivisions(
        tournamentId,
        organizerInfoForPush
      );
      divisionsPricingUpdated = pricingResult.updated;
    } catch (pushErr) {
      console.warn("[Tournament] pushPricingToDivisions:", pushErr.message);
    }

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Tournament updated successfully",
      tournamentData: tournament.toJSON(),
      divisionsScoringUpdated,
      divisionsPricingUpdated,
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

const deleteTournamentById = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId } = req.params;
    const hostId = req.user.id;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId, hostId },
      transaction: t,
    });

    if (!tournament) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Tournament not found or access denied",
      });
    }

    if (["ongoing", "completed"].includes(tournament.status)) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Cannot delete a tournament that is ongoing or completed",
      });
    }

    const regCount = await PlayerRegistration.count({
      where: { tournamentId },
      transaction: t,
    });
    if (regCount > 0) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message:
          "Cannot delete a tournament with player registrations. Remove players first.",
      });
    }

    await Bracket.destroy({ where: { tournamentId }, transaction: t });
    await tournament.destroy({ transaction: t });
    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Tournament deleted successfully",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const getTournamentDashboard = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const hostId = req.user.id;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId, hostId },
      include: [
        { model: Club, attributes: ["id", "name"] },
        {
          model: Bracket,
          include: [
            { model: Event, attributes: ["eventName"] },
            { model: BracketFormat, attributes: ["name"] },
          ],
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Tournament not found or access denied",
      });
    }

    const { settings } = parseTournamentSettings(tournament.organizerInfo);
    const brackets = [];
    let totalRegistered = 0;
    let totalCapacity = 0;

    for (const bracket of tournament.Brackets || []) {
      const registeredCount = await enrichBracketRegistrationStats(bracket);
      const maxTeams = Number(bracket.maxTeams || 0);
      const fillPct =
        maxTeams > 0 ? Math.round((registeredCount / maxTeams) * 100) : 0;
      totalRegistered += registeredCount;
      totalCapacity += maxTeams;

      brackets.push({
        id: bracket.id,
        name: bracket.name,
        formatLabel: bracket.BracketFormat?.name || bracket.Event?.eventName,
        eventName: bracket.Event?.eventName,
        maxTeams,
        registeredCount,
        fillPct,
        status: bracket.status,
        poolStarted: Boolean(bracket.poolStarted),
        registrationFee: Number(bracket.registrationFee || 0),
      });
    }

    const paidCount = await PlayerRegistration.count({
      where: { tournamentId, paymentStatus: "paid" },
    });
    const revenue = Math.round(paidCount * Number(tournament.entryFee || 0));

    const infoComplete = Boolean(
      tournament.name &&
        tournament.startDate &&
        tournament.endDate &&
        tournament.location
    );

    const checklist = {
      infoComplete,
      hasDivisions: brackets.length > 0,
      settingsConfirmed: Boolean(settings.settingsConfirmed),
      isPublished: tournament.status === "active" || tournament.status === "ongoing",
      isLive: tournament.status === "ongoing",
      anyPoolStarted: brackets.some((b) => b.poolStarted),
    };

    return res.status(200).json({
      code: 200,
      error: false,
      data: {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          slug: tournament.slug,
          status: tournament.status,
          displayStatus: displayStatusLabel(tournament.status),
          hubStatus: computeHubStatus(tournament.toJSON()),
          location: tournament.location,
          venue: tournament.venue,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          duprRecorded: tournament.duprRecorded,
          duprEnforced: tournament.duprEnforced,
          banner: tournament.tournamentTumbnail || null,
          clubName: tournament.Club?.name,
        },
        settingsConfirmed: Boolean(settings.settingsConfirmed),
        settingsConfirmedAt: settings.settingsConfirmedAt,
        metrics: {
          registeredPlayers: totalRegistered,
          totalCapacity,
          fillPct:
            totalCapacity > 0
              ? Math.round((totalRegistered / totalCapacity) * 100)
              : 0,
          revenue,
          divisionCount: brackets.length,
        },
        brackets,
        checklist,
        visibility: settings.visibility || {
          publicTournamentPage: true,
          privateOnly: false,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const patchTournamentStatus = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { status: nextStatus } = req.body;
    const hostId = req.user.id;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId, hostId },
    });

    if (!tournament) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Tournament not found or access denied",
      });
    }

    const current = tournament.status;
    if (!canTransitionStatus(current, nextStatus)) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: `Cannot change status from ${displayStatusLabel(current)} to ${displayStatusLabel(nextStatus)}`,
      });
    }

    if (nextStatus === "active") {
      const { settings } = parseTournamentSettings(tournament.organizerInfo);
      if (!settings.settingsConfirmed) {
        return res.status(400).json({
          code: 400,
          error: true,
          message:
            "Confirm tournament settings before publishing.",
        });
      }
    }

    if (nextStatus === "ongoing") {
      const liveGate = canStartTournamentLive(
        tournament.startDate,
        tournament.timezone
      );
      if (!liveGate.allowed) {
        return res.status(400).json({
          code: 400,
          error: true,
          message: liveGate.reason,
        });
      }
    }

    await tournament.update({ status: nextStatus });

    return res.status(200).json({
      code: 200,
      error: false,
      message: "Tournament status updated",
      data: {
        status: tournament.status,
        displayStatus: displayStatusLabel(tournament.status),
      },
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
    });
  }
};

const pushTournamentSettings = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId } = req.params;
    const { sections = [], bracketIds } = req.body;
    const hostId = req.user.id;

    const tournament = await Tournament.findOne({
      where: { id: tournamentId, hostId },
      transaction: t,
    });

    if (!tournament) {
      await t.rollback();
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Tournament not found or access denied",
      });
    }

    const organizerInfo = tournament.organizerInfo;
    const results = { playRules: 0, pricing: 0 };

    if (sections.includes("playRules")) {
      const r = await pushPlayRulesToDivisions(
        tournamentId,
        organizerInfo,
        t
      );
      results.playRules = r.updated;
    }
    if (sections.includes("pricing")) {
      const r = await pushPricingToDivisions(
        tournamentId,
        organizerInfo,
        { bracketIds },
        t
      );
      results.pricing = r.updated;
    }

    await t.commit();

    return res.status(200).json({
      code: 200,
      error: false,
      message: "Settings pushed to divisions",
      data: results,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      code: 500,
      error: true,
      message: error.message,
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

const uploadTournamentMedia = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const purpose = String(req.query.purpose || req.body?.purpose || "media").trim();

    if (!req.file) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "No file uploaded",
      });
    }

    const tournament = await Tournament.findOne({
      where: { id: tournamentId, hostId: req.user.id },
    });

    if (!tournament) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Tournament not found or access denied",
      });
    }

    const folderPurpose =
      purpose === "banner" ? "banner" : purpose === "sponsor-logo" ? "sponsors" : purpose;

    const result = await uploadTournamentImage({
      tournamentId,
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      purpose: folderPurpose,
    });

    if (purpose === "banner") {
      const oldKey = extractMediaKey(tournament.getDataValue("tournamentTumbnail"));
      if (oldKey && oldKey !== result.key) {
        await deleteTournamentImage(oldKey);
      }
      await tournament.update({ tournamentTumbnail: result.key });
    }

    return res.status(201).json({
      error: false,
      code: 201,
      message: "Media uploaded",
      data: result,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      error: true,
      code: status,
      message: error.message || "Upload failed",
    });
  }
};

export default {
  createTournament,
  getAllTournamentsOfHost,
  getAllTournamentsOfStatusActive,
  getAllTournaments,
  getTournamentById,
  getTournamentBySlug,
  updatingTournamentById,
  deleteTournamentById,
  getTournamentAndBracketDataByTournamentId,
  getTournamentDashboard,
  patchTournamentStatus,
  pushTournamentSettings,
  invitePlayers,
  uploadTournamentMedia,
};
