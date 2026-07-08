import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import {
  EmailQueueUnavailableError,
  enqueueEmailBatch,
} from "../utils/enqueueEmail.js";
import models from "../models/Associations.js";
import { parseOrganizerInfo } from "../utils/tournamentHub.js";
import {
  resolveBracketScoringFromTournament,
  resolveDefaultScoringIds,
} from "../utils/bracketScoring.js";
import { parseScoringConfig } from "../utils/scoringRules.js";
import {
  MAX_PAYMENT_EMAILS,
  buildPaymentEmailPayload,
  buildPaymentRegistrationJob,
  computeRegistrationAmountDue,
  getPaymentPhone,
  hasPaymentInstructions,
} from "../utils/paymentRegistrationEmail.js";
import { linkBulkUploadPartners } from "../utils/linkRegistrationPartners.js";
import { parseDuprCombinedRating, parseDuprRating } from "../utils/parseDuprRating.js";
import { validateMlpTeamRoster } from "../utils/mlpRosterValidation.js";

// const {
//   Tournament,
//   Bracket,
//   Group,
//   Format,
//   BracketFormat,
//   ScoringList,
//   PlayoffSeeding,
//   Event,
//   PlayerRegistration,
//   User,
//   Role,
//   UserRole,
//   Pool,
// } = models;
const {
  Tournament,
  Bracket,
  Group,
  Format,
  BracketFormat,
  ScoringList,
  PlayoffSeeding,
  Event,
  PlayerRegistration,
  User,
  Role,
  UserRole,
  Pool,
  Team,
  TeamPlayer,
  Club,
} = models;

const assertHostTournament = async (tournamentId, hostId) => {
  const tournament = await Tournament.findOne({
    where: { id: tournamentId, hostId },
  });
  if (!tournament) {
    const err = new Error("Tournament not found or access denied");
    err.status = 404;
    throw err;
  }
  return tournament;
};

const resolvePlayoffSeedingId = async (transaction = null) => {
  const playoffSeeding = await PlayoffSeeding.findOne({
    order: [["id", "ASC"]],
    transaction,
  });
  if (!playoffSeeding) {
    const err = new Error(
      "Bracket metadata missing. Run database seed (playoff seedings)."
    );
    err.status = 500;
    throw err;
  }
  return playoffSeeding.id;
};

const resolveDivisionScoring = async (tournament, transaction = null) => {
  try {
    const scoring = await resolveBracketScoringFromTournament(
      tournament,
      transaction
    );
    return scoring;
  } catch {
    return resolveDefaultScoringIds(transaction);
  }
};

const mergeDivisionScoringConfig = (resolved, input, tournament) => {
  const useGlobal = input?.useGlobalSettings !== false;
  const existing =
    resolved?.scoringConfig && typeof resolved.scoringConfig === "object"
      ? { ...resolved.scoringConfig }
      : {};

  const scoringConfig = {
    ...existing,
    useGlobalSettings: useGlobal,
    ...(input?.accentColor != null && String(input.accentColor).trim() !== ""
      ? { accentColor: String(input.accentColor).trim() }
      : existing.accentColor
        ? { accentColor: existing.accentColor }
        : {}),
    ...(input?.registrationOn !== undefined
      ? { registrationOn: Boolean(input.registrationOn) }
      : {}),
    ...(input?.showPublic !== undefined
      ? { showPublic: Boolean(input.showPublic) }
      : {}),
    ...(input?.duprRecorded !== undefined
      ? { duprRecorded: Boolean(input.duprRecorded) }
      : {}),
    ...(input?.duprEnforced !== undefined
      ? { duprEnforced: Boolean(input.duprEnforced) }
      : {}),
    ...(input?.duprCombinedMin !== undefined
      ? { duprCombinedMin: parseDuprCombinedRating(input.duprCombinedMin) }
      : {}),
    ...(input?.duprCombinedMax !== undefined
      ? { duprCombinedMax: parseDuprCombinedRating(input.duprCombinedMax) }
      : {}),
    ...(input?.skillLevel !== undefined
      ? { skillLevel: String(input.skillLevel || "").trim() }
      : {}),
    ...(input?.teamsPerPool !== undefined
      ? { teamsPerPool: Number(input.teamsPerPool) || 4 }
      : {}),
    ...(input?.seedingMethod !== undefined
      ? { seedingMethod: String(input.seedingMethod || "").trim() }
      : {}),
  };

  if (!useGlobal) {
    scoringConfig.pricingTiers = input?.pricingTiers || [];
    if (input?.matchScoring && typeof input.matchScoring === "object") {
      scoringConfig.matchScoring = input.matchScoring;
    }
  } else if (input?.matchScoring && typeof input.matchScoring === "object") {
    scoringConfig.matchScoring = {
      ...(existing.matchScoring || {}),
      ...input.matchScoring,
    };
  }

  if (input?.seedingMethod !== undefined && useGlobal) {
    scoringConfig.seedingMethod = String(input.seedingMethod || "").trim();
  }

  if (input?.teamsPerPool !== undefined) {
    scoringConfig.teamsPerPool = Number(input.teamsPerPool) || 4;
  }

  if (scoringConfig.duprRecorded === undefined) {
    scoringConfig.duprRecorded = Boolean(tournament?.duprRecorded ?? true);
  }
  if (scoringConfig.duprEnforced === undefined) {
    scoringConfig.duprEnforced = Boolean(tournament?.duprEnforced ?? false);
  }
  if (scoringConfig.registrationOn === undefined) {
    scoringConfig.registrationOn = true;
  }
  if (scoringConfig.showPublic === undefined) {
    scoringConfig.showPublic = true;
  }

  return { ...resolved, scoringConfig };
};

const buildDivisionScoringFields = async (
  tournament,
  body,
  transaction,
  existingBracket = null
) => {
  const resolved = await resolveDivisionScoring(tournament, transaction);
  const input = body.scoringConfig || {};
  const prior = existingBracket ? parseScoringConfig(existingBracket) || {} : {};
  const useGlobal = input.useGlobalSettings !== false;

  const baseConfig = useGlobal
    ? { ...prior, ...resolved.scoringConfig }
    : { ...resolved.scoringConfig, ...prior };

  return mergeDivisionScoringConfig(
    { ...resolved, scoringConfig: baseConfig },
    input,
    tournament
  );
};

const findOrCreateEvent = async (groupId, formatId, transaction) => {
  const [group, format] = await Promise.all([
    Group.findByPk(groupId, { transaction }),
    Format.findByPk(formatId, { transaction }),
  ]);
  if (!group || !format) {
    const err = new Error("Invalid group or format");
    err.status = 400;
    throw err;
  }
  const eventName = `${group.name} ${format.name}`;
  let event = await Event.findOne({ where: { eventName }, transaction });
  if (!event) {
    event = await Event.create({ eventName }, { transaction });
  }
  return { event, group, format };
};

const mapBracketRow = async (bracket) => {
  const json = bracket.toJSON();
  const registeredCount = await PlayerRegistration.count({
    where: { bracketId: bracket.id },
  });
  const eventName = json.Event?.eventName || "";
  const isDoubles = /double/i.test(eventName);
  const isSingles = /single/i.test(eventName);
  const isMlp = /mlp/i.test(eventName);
  let formatLabel = eventName;
  if (isMlp) formatLabel = `${eventName} · Team`;
  else if (isDoubles) formatLabel = `${eventName} · Doubles`;
  else if (isSingles) formatLabel = `${eventName} · Singles`;

  const scoringConfig = parseScoringConfig(bracket);

  return {
    ...json,
    registeredCount,
    poolStarted: Boolean(json.poolStarted),
    formatLabel,
    eventType: isMlp ? "mlp" : isDoubles ? "doubles" : isSingles ? "singles" : "other",
    scoringConfig,
    scoringLabels: scoringConfig
      ? {
          pool: scoringConfig.pool?.label,
          playoff: scoringConfig.playoff?.label,
          semi: scoringConfig.semi?.label,
          gold: scoringConfig.gold?.label,
          bronze: scoringConfig.bronze?.label,
        }
      : null,
  };
};

const parseName = (fullName) => {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstname: "Player", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(" "),
  };
};

const normalizeGender = (value) => {
  const g = String(value || "M").trim().toLowerCase();
  if (g.startsWith("f")) return "female";
  if (g.startsWith("m")) return "male";
  return "male";
};

const normalizeRegistrationPaymentStatus = (row) => {
  const v = String(row.paymentStatus || row.PaymentStatus || "unpaid")
    .trim()
    .toLowerCase();
  if (v === "paid" || v === "refunded") return v;
  return "unpaid";
};

const isMlpEventName = (eventName) => /mlp/i.test(String(eventName || ""));

const resolveBulkUploadTeamRole = (value) => {
  const v = String(value || "")
    .trim()
    .toLowerCase();
  if (v === "partner" || v === "host") return v;
  return "player";
};

const getBulkUploadDivisionCapacity = (eventName, maxTeams) => {
  if (isMlpEventName(eventName)) return Number(maxTeams || 0) * 6;
  if (/double|mixed/i.test(String(eventName || ""))) return Number(maxTeams || 0) * 2;
  return Number(maxTeams || 0);
};

const summarizeMlpTeamRoster = async (teamId, transaction = null) => {
  const roster = await TeamPlayer.findAll({
    where: { teamId },
    include: [{ model: User, as: "User", attributes: ["gender"] }],
    transaction,
  });

  let males = 0;
  let females = 0;
  for (const slot of roster) {
    const gender = String(slot.User?.gender || "").toLowerCase();
    if (gender.startsWith("m")) males += 1;
    else if (gender.startsWith("f")) females += 1;
  }

  return {
    playerCount: roster.length,
    males,
    females,
    isComplete: roster.length >= 4 && males >= 2 && females >= 2,
  };
};

const resolveBulkUploadPhone = (row) => {
  const phone = String(row.phone || row.Phone || "").trim();
  if (phone && /^\+?[0-9\s-()]{7,25}$/.test(phone)) return phone;
  return "+10000000000";
};

const partnerMatches = (row, other) => {
  const partner = String(row.partner || "").trim().toLowerCase();
  if (!partner || partner === "-") return false;
  const otherName = `${other.name || ""}`.trim().toLowerCase();
  const otherEmail = `${other.email || ""}`.trim().toLowerCase();
  return (
    partner === otherName ||
    partner === otherEmail ||
    otherName.includes(partner) ||
    partner.includes(otherName.split(" ")[0] || "")
  );
};

const computeAmountDue = (fee, row, bracketMap, allRows) => {
  const eventName = bracketMap.get(String(row.division || "").toLowerCase())?.eventName || "";
  const isDoubles = /double|mixed/i.test(eventName);
  const isMlp = /mlp/i.test(eventName);
  if (isMlp) return Number(fee);

  const payForPartner =
    row.pay_for_partner !== false &&
    row.payForPartner !== false &&
    String(row.pay_for_partner || row.payForPartner || "")
      .toLowerCase()
      .trim() !== "no";

  if (isDoubles && payForPartner && row.partner && row.partner !== "-") {
    const hasPartnerRow = allRows.some(
      (other) =>
        other !== row &&
        String(other.division || "").toLowerCase() ===
          String(row.division || "").toLowerCase() &&
        partnerMatches(row, other)
    );
    if (hasPartnerRow) return Number(fee) * 2;
  }
  return Number(fee);
};

export const getBracketMeta = async (req, res) => {
  try {
    const [groups, formats, bracketFormats, scoringLists, playoffSeedings] =
      await Promise.all([
        Group.findAll({ order: [["name", "ASC"]] }),
        Format.findAll({ order: [["name", "ASC"]] }),
        BracketFormat.findAll({ order: [["name", "ASC"]] }),
        ScoringList.findAll({ order: [["name", "ASC"]] }),
        PlayoffSeeding.findAll({ order: [["name", "ASC"]] }),
      ]);

    res.status(200).json({
      code: 200,
      error: false,
      data: {
        groups,
        formats,
        bracketFormats,
        scoringLists,
        playoffSeedings,
      },
    });
  } catch (error) {
    res.status(500).json({ code: 500, error: true, message: error.message });
  }
};

export const listDivisions = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    await assertHostTournament(tournamentId, req.user.id);

    const brackets = await Bracket.findAll({
      where: { tournamentId },
      include: [
        { model: Event, attributes: ["id", "eventName"] },
        { model: BracketFormat, attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(brackets.map(mapBracketRow));

    res.status(200).json({
      code: 200,
      error: false,
      message: "Divisions fetched",
      data,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

export const createDivision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId } = req.params;
    const tournament = await assertHostTournament(tournamentId, req.user.id);

    const {
      bracketName,
      groupId,
      formatId,
      bracketFormatId,
      maxTeams,
      registrationFee,
      minAge = 0,
      maxAge = 0,
      minRating = 0,
      maxRating = 0,
      startDate,
      endDate,
      startTime,
      status = "draft",
    } = req.body;

    const parsedMinRating = parseDuprRating(minRating) ?? (Number(minRating) || 0);
    const parsedMaxRating = parseDuprRating(maxRating) ?? (Number(maxRating) || 0);

    const scoringResolved = await buildDivisionScoringFields(
      tournament,
      req.body,
      t
    );
    const playoffSeedingId = await resolvePlayoffSeedingId(t);
    const { event } = await findOrCreateEvent(groupId, formatId, t);

    const existing = await Bracket.findOne({
      where: { name: bracketName, tournamentId, eventId: event.id },
      transaction: t,
    });
    if (existing) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        error: true,
        message: "A division with this name already exists for this event type.",
      });
    }

    const bracket = await Bracket.create(
      {
        tournamentId: tournament.id,
        name: bracketName,
        maxTeams,
        eventId: event.id,
        bracketFormatId,
        minAge,
        maxAge,
        minRating: parsedMinRating,
        maxRating: parsedMaxRating,
        status,
        startDate: startDate || tournament.startDate,
        endDate: endDate || tournament.endDate,
        startTime: startTime || null,
        registrationFee: registrationFee ?? tournament.entryFee ?? 0,
        playoffSeedingId,
        ...scoringResolved,
      },
      { transaction: t }
    );

    await t.commit();

    const full = await Bracket.findByPk(bracket.id, {
      include: [
        { model: Event, attributes: ["id", "eventName"] },
        { model: BracketFormat, attributes: ["id", "name"] },
      ],
    });

    res.status(201).json({
      code: 201,
      error: false,
      message: "Division created",
      data: await mapBracketRow(full),
    });
  } catch (error) {
    await t.rollback();
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

export const updateDivision = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId } = req.params;
    await assertHostTournament(tournamentId, req.user.id);

    const bracket = await Bracket.findOne({
      where: { id: bracketId, tournamentId },
      transaction: t,
    });
    if (!bracket) {
      await t.rollback();
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Division not found",
      });
    }

    if (bracket.poolStarted) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Cannot edit division after pool play has started",
      });
    }

    const {
      bracketName,
      groupId,
      formatId,
      bracketFormatId,
      maxTeams,
      registrationFee,
      minAge,
      maxAge,
      minRating,
      maxRating,
      startDate,
      endDate,
      startTime,
      status,
    } = req.body;

    const tournament = await Tournament.findByPk(tournamentId, { transaction: t });

    let eventId = bracket.eventId;
    if (groupId && formatId) {
      const { event } = await findOrCreateEvent(groupId, formatId, t);
      eventId = event.id;
    }

    const scoringFields = tournament
      ? await buildDivisionScoringFields(tournament, req.body, t, bracket)
      : {};

    await bracket.update(
      {
        ...(bracketName !== undefined && { name: bracketName }),
        ...(groupId && formatId && { eventId }),
        ...(bracketFormatId !== undefined && { bracketFormatId }),
        ...(maxTeams !== undefined && { maxTeams }),
        ...(registrationFee !== undefined && { registrationFee }),
        ...(minAge !== undefined && { minAge }),
        ...(maxAge !== undefined && { maxAge }),
        ...(minRating !== undefined && {
          minRating: parseDuprRating(minRating) ?? (Number(minRating) || 0),
        }),
        ...(maxRating !== undefined && {
          maxRating: parseDuprRating(maxRating) ?? (Number(maxRating) || 0),
        }),
        ...(startDate !== undefined && { startDate }),
        ...(endDate !== undefined && { endDate }),
        ...(startTime !== undefined && { startTime: startTime || null }),
        ...(status !== undefined && { status }),
        ...(scoringFields || {}),
      },
      { transaction: t }
    );

    await t.commit();

    const full = await Bracket.findByPk(bracket.id, {
      include: [
        { model: Event, attributes: ["id", "eventName"] },
        { model: BracketFormat, attributes: ["id", "name"] },
      ],
    });

    res.status(200).json({
      code: 200,
      error: false,
      message: "Division updated",
      data: await mapBracketRow(full),
    });
  } catch (error) {
    await t.rollback();
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

export const deleteDivision = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;
    await assertHostTournament(tournamentId, req.user.id);

    const bracket = await Bracket.findOne({
      where: { id: bracketId, tournamentId },
    });
    if (!bracket) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Division not found",
      });
    }

    if (bracket.poolStarted) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Cannot delete division after pool play has started",
      });
    }

    const poolCount = await Pool.count({ where: { bracketId } });
    if (poolCount > 0) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Cannot delete division with existing pools",
      });
    }

    const regCount = await PlayerRegistration.count({ where: { bracketId } });
    if (regCount > 0) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Cannot delete division with registered players",
      });
    }

    await bracket.destroy();

    res.status(200).json({
      code: 200,
      error: false,
      message: "Division deleted",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

export const bulkUploadPlayers = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId } = req.params;
    const { rows = [], sendEmails = true } = req.body;
    const tournament = await assertHostTournament(tournamentId, req.user.id);

    let defaultClubName = null;
    if (tournament.clubId) {
      const club = await Club.findByPk(tournament.clubId, {
        attributes: ["name"],
        transaction: t,
      });
      defaultClubName = club?.name || null;
    }

    if (!Array.isArray(rows) || !rows.length) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        error: true,
        message: "No rows provided",
      });
    }

    const paymentPhone = getPaymentPhone(tournament);
    if (sendEmails && !hasPaymentInstructions(tournament)) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        error: true,
        message:
          "At least one payment method (mobile, Zelle, or Venmo) is required in Tournament Settings before sending registration emails.",
      });
    }

    const brackets = await Bracket.findAll({
      where: { tournamentId },
      include: [{ model: Event, attributes: ["eventName"] }],
      transaction: t,
    });

    const bracketByName = new Map();
    const bracketMap = new Map();
    for (const b of brackets) {
      const key = b.name.toLowerCase();
      bracketByName.set(key, b);
      bracketMap.set(key, {
        id: b.id,
        fee: Number(b.registrationFee || tournament.entryFee || 0),
        eventName: b.Event?.eventName || "",
        maxTeams: b.maxTeams,
      });
    }

    const playerRole = await Role.findOne({
      where: { name: "player" },
      transaction: t,
    });
    if (!playerRole) {
      await t.rollback();
      return res.status(500).json({
        code: 500,
        error: true,
        message: "Player role not found in database",
      });
    }

    const created = [];
    const skipped = [];
    const errors = [];
    const emailQueue = [];
    const batchRegs = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      try {
        const email = String(row.email || row.Email || "").trim().toLowerCase();
        const name = String(row.name || row.Name || "").trim();
        const divisionKey = String(row.division || row.Division || "")
          .trim()
          .toLowerCase();

        if (!email || !name) {
          errors.push({ row: rowNum, reason: "Name and email are required" });
          continue;
        }

        const bracket = bracketByName.get(divisionKey);
        if (!bracket) {
          errors.push({
            row: rowNum,
            reason: `Division "${row.division || row.Division}" not found`,
          });
          continue;
        }

        const eventName = bracket.Event?.eventName?.toLowerCase() || "";
        const isMlpDivision = isMlpEventName(eventName);

        const gender = normalizeGender(row.gender || row.Gender);
        if (/\bmen\b/.test(eventName) && gender !== "male") {
          errors.push({ row: rowNum, reason: "Men's division requires male gender" });
          continue;
        }
        if (/\bwomen\b/.test(eventName) && gender !== "female") {
          errors.push({
            row: rowNum,
            reason: "Women's division requires female gender",
          });
          continue;
        }

        const { firstname, lastname } = parseName(name);
        const regPaymentStatus = normalizeRegistrationPaymentStatus(row);
        let player = await User.findOne({ where: { email }, transaction: t });

        if (!player) {
          const password = await bcrypt.hash(`${firstname}@12345`, 10);
          const verificationToken = crypto.randomBytes(32).toString("hex");
          player = await User.create(
            {
              firstname,
              lastname,
              email,
              password,
              age: Number(row.age || 30) || 30,
              gender,
              phoneNumber: resolveBulkUploadPhone(row),
              isVerified: false,
              accountExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              verificationToken,
              duprId: String(row.duprId || row.DuprID || "").trim() || null,
              instagram: String(row.instagram || "").trim() || null,
              facebook: String(row.facebook || "").trim() || null,
              paymentMethod: String(row.paymentMethod || "").trim() || null,
              paymentStatus: regPaymentStatus,
              roleId: playerRole.id,
            },
            { transaction: t }
          );


          await UserRole.create(
            { userId: player.id, roleId: playerRole.id },
            { transaction: t }
          );
        } else {
          await UserRole.findOrCreate({
            where: { userId: player.id, roleId: playerRole.id },
            transaction: t,
          }); 
          const updates = {};
          if (!player.duprId && row.duprId) updates.duprId = String(row.duprId).trim();
          if (!player.instagram && row.instagram) updates.instagram = String(row.instagram).trim();
          if (!player.facebook && row.facebook) updates.facebook = String(row.facebook).trim();
          if (!player.paymentMethod && row.paymentMethod) updates.paymentMethod = String(row.paymentMethod).trim(); // ADD
          if (row.paymentStatus) updates.paymentStatus = String(row.paymentStatus).trim();                          // ADD
          if (Object.keys(updates).length) {
  await player.update(updates, { transaction: t });
}
        } 
        

        const duprVal =
          parseDuprRating(row.dupr ?? row.DUPR) ??
          parseDuprRating(row.duprId ?? row.DuprID);
        if (duprVal !== null) {
          await player.update({ duprRating: duprVal }, { transaction: t });
        }

        const existingReg = await PlayerRegistration.findOne({
          where: {
            playerId: player.id,
            tournamentId,
            bracketId: bracket.id,
          },
          transaction: t,
        });

        if (existingReg) {
          skipped.push({ row: rowNum, email, reason: "Already registered" });
          continue;
        }

        const regCount = await PlayerRegistration.count({
          where: { tournamentId, bracketId: bracket.id },
          transaction: t,
        });
        const capacity = getBulkUploadDivisionCapacity(eventName, bracket.maxTeams);
        if (regCount >= capacity) {
          errors.push({ row: rowNum, reason: "Division is full" });
          continue;
        }

        const registration = await PlayerRegistration.create(
          {
            playerId: player.id,
            tournamentId,
            bracketId: bracket.id,
            status: "registered",
            paymentStatus: regPaymentStatus,
            playerRole: String(row.role || "starter").trim().toLowerCase(),
            division: String(row.division || "").trim() || null,
            rosterNumber:
              String(row.rosterNumber || row.roster_number || "").trim() || null,
            clubName:
              String(row.clubName || row.club_name || "").trim() ||
              defaultClubName,
          },
          { transaction: t }
        );
        
       const teamName = String(
            row.teamName || row.team_name || ""
          ).trim();
          if (teamName) {
            let team = await Team.findOne({
              where: { tournamentId, bracketId: bracket.id, teamName },
              transaction: t,
            });
            if (!team) {
              team = await Team.create(
                {
                  teamName,
                  bracketId: bracket.id,
                  tournamentId,
                  status: "registered",
                  paymentStatus: regPaymentStatus === "paid" ? "paid" : "unpaid",
                  isComplete: false,
                },
                { transaction: t }
              );
            }
            if (isMlpDivision) {
              const existingRosterCount = await TeamPlayer.count({
                where: { teamId: team.id },
                transaction: t,
              });
              if (existingRosterCount >= 6) {
                await registration.destroy({ transaction: t });
                errors.push({
                  row: rowNum,
                  reason: `MLP team "${teamName}" cannot have more than 6 players`,
                });
                continue;
              }
            }
            await TeamPlayer.findOrCreate({
              where: { playerId: player.id, teamId: team.id },
              defaults: {
                role: resolveBulkUploadTeamRole(row.role),
              },
              transaction: t,
            });
            if (isMlpDivision) {
              const roster = await summarizeMlpTeamRoster(team.id, t);
              await team.update({ isComplete: roster.isComplete }, { transaction: t });
            }
          }

        const fee = Number(bracket.registrationFee || tournament.entryFee || 0);
        const amountDue = computeAmountDue(fee, row, bracketMap, rows);

        created.push({
          row: rowNum,
          email,
          division: bracket.name,
          amountDue,
          registrationId: registration.id,
        });

        batchRegs.push({
          registrationId: registration.id,
          playerId: player.id,
          bracketId: bracket.id,
          email,
          name,
          row,
        });

        if (sendEmails && regPaymentStatus === "unpaid") {
          emailQueue.push({
            registrationId: registration.id,
            payload: buildPaymentEmailPayload({
              tournament,
              bracket,
              user: player,
              hostUser: req.user,
              amountDue,
              paymentPhone,
            }),
          });
        }
      } catch (rowErr) {
        errors.push({ row: rowNum, reason: rowErr.message });
      }
    }

    await linkBulkUploadPartners(batchRegs, tournamentId, t);

    await t.commit();

    let emailsQueued = 0;
    if (emailQueue.length) {
      try {
        const jobs = emailQueue.map((item) =>
          buildPaymentRegistrationJob(item.registrationId, item.payload)
        );
        emailsQueued = await enqueueEmailBatch(jobs);
      } catch (mailErr) {
        if (mailErr instanceof EmailQueueUnavailableError) {
          return res.status(503).json({
            code: 503,
            error: true,
            message: mailErr.message,
            data: { created, skipped, errors, emailsQueued: 0 },
          });
        }
        throw mailErr;
      }
    }

    res.status(200).json({
      code: 200,
      error: false,
      message: `Bulk upload complete: ${created.length} registered`,
      data: { created, skipped, errors, emailsQueued },
    });

  } catch (error) {
    try {
      await t.rollback();
    } catch {
     
    }
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

export const resendPaymentEmails = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { registrationIds } = req.body;

    if (!Array.isArray(registrationIds) || !registrationIds.length) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "registrationIds must be a non-empty array",
      });
    }

    const tournament = await assertHostTournament(tournamentId, req.user.id);
    const paymentPhone = getPaymentPhone(tournament);
    if (!hasPaymentInstructions(tournament)) {
      return res.status(400).json({
        code: 400,
        error: true,
        message:
          "At least one payment method (mobile, Zelle, or Venmo) is required in Tournament Settings before sending registration emails.",
      });
    }

    const uniqueIds = [
      ...new Set(
        registrationIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];

    if (!uniqueIds.length) {
      return res.status(400).json({
        code: 400,
        error: true,
        message: "No valid registration IDs provided",
      });
    }

    const registrations = await PlayerRegistration.findAll({
      where: {
        id: { [Op.in]: uniqueIds },
        tournamentId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "lastname", "email"],
        },
        {
          model: Bracket,
          attributes: ["id", "name", "registrationFee"],
        },
      ],
    });

    const regById = new Map(registrations.map((r) => [r.id, r]));
    const queued = [];
    const skipped = [];
    const jobsToEnqueue = [];

    for (const id of uniqueIds) {
      const reg = regById.get(id);
      if (!reg) {
        skipped.push({ registrationId: id, reason: "Registration not found" });
        continue;
      }
      if (reg.paymentStatus !== "unpaid") {
        skipped.push({
          registrationId: id,
          email: reg.User?.email,
          reason: "Only unpaid registrations can receive payment emails",
        });
        continue;
      }
      if (reg.paymentEmailSentCount >= MAX_PAYMENT_EMAILS) {
        skipped.push({
          registrationId: id,
          email: reg.User?.email,
          reason: `Payment email limit reached (${MAX_PAYMENT_EMAILS} max)`,
        });
        continue;
      }

      const amountDue = computeRegistrationAmountDue(reg.Bracket, tournament);
      const payload = buildPaymentEmailPayload({
        tournament,
        bracket: reg.Bracket,
        user: reg.User,
        hostUser: req.user,
        amountDue,
        paymentPhone,
      });

      jobsToEnqueue.push({
        job: buildPaymentRegistrationJob(id, payload),
        meta: { registrationId: id, email: reg.User.email },
      });
    }

    if (jobsToEnqueue.length) {
      try {
        await enqueueEmailBatch(jobsToEnqueue.map((item) => item.job));
        for (const item of jobsToEnqueue) {
          queued.push(item.meta);
        }
      } catch (mailErr) {
        if (mailErr instanceof EmailQueueUnavailableError) {
          return res.status(503).json({
            code: 503,
            error: true,
            message: mailErr.message,
            data: { queued: [], skipped, maxPaymentEmails: MAX_PAYMENT_EMAILS },
          });
        }
        throw mailErr;
      }
    }

    res.status(200).json({
      code: 200,
      error: false,
      message: `Payment emails: ${queued.length} queued, ${skipped.length} skipped`,
      data: { queued, skipped, maxPaymentEmails: MAX_PAYMENT_EMAILS },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message,
    });
  }
};

const applyPaymentStatusToRegistration = async (
  reg,
  paymentStatus,
  syncPartner,
  tournamentId,
  transaction
) => {
  await reg.update({ paymentStatus }, { transaction });
  const updated = [{ registrationId: reg.id, paymentStatus }];

  if (syncPartner !== false && reg.partnerId) {
    const partnerReg = await PlayerRegistration.findOne({
      where: {
        playerId: reg.partnerId,
        tournamentId,
        bracketId: reg.bracketId,
      },
      transaction,
    });
    if (partnerReg && partnerReg.id !== reg.id) {
      await partnerReg.update({ paymentStatus }, { transaction });
      updated.push({ registrationId: partnerReg.id, paymentStatus });
    }
  }
  return updated;
};

const safeRollback = async (transaction) => {
  if (!transaction) return;
  try {
    await transaction.rollback();
  } catch {
    /* already finished */
  }
};

export const updateRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tournamentId = Number(req.params.tournamentId);
    const registrationId = Number(req.params.registrationId);
    const body = req.body;

    if (!Number.isInteger(tournamentId) || !Number.isInteger(registrationId)) {
      await safeRollback(t);
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Invalid tournament or registration id",
      });
    }

    const tournament = await assertHostTournament(tournamentId, req.user.id);

    if (["ongoing", "completed"].includes(tournament.status)) {
      await safeRollback(t);
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Cannot edit registrations after the tournament has started",
      });
    }

    const reg = await PlayerRegistration.findOne({
      where: { id: registrationId, tournamentId },
      include: [{ model: User }],
      transaction: t,
    });
    if (!reg) {
      await safeRollback(t);
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Registration not found",
      });
    }

    const user = reg.User;
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      age,
      gender,
      bracketId: newBracketId,
      clubName,
      partner,
      duprRating,
      duprId,
      rosterNumber,
      playerRole,
      status,
      teamId,
    } = body;

    if (firstname !== undefined) user.firstname = String(firstname).trim();
    if (lastname !== undefined) user.lastname = String(lastname).trim();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (phoneNumber !== undefined) user.phoneNumber = String(phoneNumber).trim();
    if (age !== undefined) user.age = Number(age) || user.age;
    if (gender !== undefined) user.gender = gender;
    if (duprId !== undefined) user.duprId = String(duprId).trim() || null;
    if (duprRating !== undefined) {
      const duprVal = parseDuprRating(duprRating);
      if (duprVal !== null) user.duprRating = duprVal;
    }
    await user.save({ transaction: t });

    if (newBracketId !== undefined && Number(newBracketId) !== reg.bracketId) {
      const targetBracketId = Number(newBracketId);
      const bracket = await Bracket.findByPk(targetBracketId, {
        include: [{ model: Event }],
        transaction: t,
      });
      if (!bracket || bracket.tournamentId !== tournamentId) {
        await safeRollback(t);
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Invalid division",
        });
      }
      if (bracket.isPoolStarted) {
        await safeRollback(t);
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Cannot move player — division pool play has started",
        });
      }
      const dup = await PlayerRegistration.findOne({
        where: { playerId: reg.playerId, tournamentId, bracketId: targetBracketId },
        transaction: t,
      });
      if (dup && dup.id !== reg.id) {
        await safeRollback(t);
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Player already registered in that division",
        });
      }
      const eventName = bracket.Event?.eventName?.toLowerCase() || "";
      if (/\bmen\b/.test(eventName) && user.gender?.toLowerCase() !== "male") {
        await safeRollback(t);
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Only male players can register for this event",
        });
      }
      if (
        /\bwomen\b/.test(eventName) &&
        user.gender?.toLowerCase() !== "female"
      ) {
        await safeRollback(t);
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Only female players can register for this event",
        });
      }
      reg.bracketId = targetBracketId;
    }

    if (clubName !== undefined) {
      reg.clubName = String(clubName).trim() || null;
    }
    if (rosterNumber !== undefined) {
      reg.rosterNumber = String(rosterNumber).trim() || null;
    }
    if (playerRole !== undefined) {
      reg.playerRole = String(playerRole).trim().toLowerCase() || null;
    }
    if (status !== undefined) reg.status = status;

    await reg.save({ transaction: t });

    if (partner !== undefined) {
      const partnerRaw = String(partner || "").trim();
      if (!partnerRaw || partnerRaw === "-") {
        if (reg.partnerId) {
          await PlayerRegistration.update(
            { partnerId: null },
            {
              where: {
                playerId: reg.partnerId,
                tournamentId,
                bracketId: reg.bracketId,
              },
              transaction: t,
            }
          );
        }
        reg.partnerId = null;
        await reg.save({ transaction: t });
      } else {
        await linkBulkUploadPartners(
          [
            {
              registrationId: reg.id,
              playerId: reg.playerId,
              bracketId: reg.bracketId,
              email: user.email,
              name: `${user.firstname} ${user.lastname}`.trim(),
              row: { partner: partnerRaw },
            },
          ],
          tournamentId,
          t
        );
      }
    }

    if (teamId !== undefined) {
      const teamsInBracket = await Team.findAll({
        where: { tournamentId, bracketId: reg.bracketId },
        attributes: ["id"],
        transaction: t,
      });
      const teamIds = teamsInBracket.map((tm) => tm.id);
      if (teamIds.length) {
        await TeamPlayer.destroy({
          where: { playerId: reg.playerId, teamId: { [Op.in]: teamIds } },
          transaction: t,
        });
      }
      const tid = teamId ? Number(teamId) : null;
      if (tid) {
        const team = await Team.findOne({
          where: { id: tid, tournamentId, bracketId: reg.bracketId },
          transaction: t,
        });
        if (!team) {
          await safeRollback(t);
          return res.status(400).json({
            code: 400,
            error: true,
            message: "Team not found in this division",
          });
        }
        await TeamPlayer.create(
          {
            playerId: reg.playerId,
            teamId: tid,
            role: reg.playerRole || "starter",
          },
          { transaction: t }
        );
        const mlpErr = await validateMlpTeamRoster(tid, t);
        if (mlpErr) {
          await safeRollback(t);
          return res.status(400).json({
            code: 400,
            error: true,
            message: mlpErr,
          });
        }
      }
    } else if (gender !== undefined) {
      const teamsInBracket = await Team.findAll({
        where: { tournamentId, bracketId: reg.bracketId },
        attributes: ["id"],
        transaction: t,
      });
      const teamIds = teamsInBracket.map((tm) => tm.id);
      if (teamIds.length) {
        const assignment = await TeamPlayer.findOne({
          where: { playerId: reg.playerId, teamId: { [Op.in]: teamIds } },
          transaction: t,
        });
        if (assignment) {
          const mlpErr = await validateMlpTeamRoster(assignment.teamId, t);
          if (mlpErr) {
            await safeRollback(t);
            return res.status(400).json({
              code: 400,
              error: true,
              message: mlpErr,
            });
          }
        }
      }
    }

    await t.commit();

    res.status(200).json({
      code: 200,
      error: false,
      message: "Registration updated",
      data: { registrationId: reg.id },
    });
  } catch (error) {
    await safeRollback(t);
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message || "Failed to update registration",
    });
  }
};

export const updateRegistrationPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tournamentId = Number(req.params.tournamentId);
    const registrationId = Number(req.params.registrationId);
    const { paymentStatus, syncPartner = true } = req.body;

    if (!Number.isInteger(tournamentId) || !Number.isInteger(registrationId)) {
      await safeRollback(t);
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Invalid tournament or registration id",
      });
    }

    await assertHostTournament(tournamentId, req.user.id);

    const reg = await PlayerRegistration.findOne({
      where: { id: registrationId, tournamentId },
      transaction: t,
    });
    if (!reg) {
      await safeRollback(t);
      return res.status(404).json({
        code: 404,
        error: true,
        message: "Registration not found",
      });
    }

    const updated = await applyPaymentStatusToRegistration(
      reg,
      paymentStatus,
      syncPartner,
      tournamentId,
      t
    );
    await t.commit();

    res.status(200).json({
      code: 200,
      error: false,
      message: "Payment status updated",
      data: { updated },
    });
  } catch (error) {
    await safeRollback(t);
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message || "Failed to update payment status",
    });
  }
};

export const bulkUpdateRegistrationPayments = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const tournamentId = Number(req.params.tournamentId);
    const { registrationIds, paymentStatus, syncPartner = true } = req.body;

    if (!Number.isInteger(tournamentId)) {
      await safeRollback(t);
      return res.status(400).json({
        code: 400,
        error: true,
        message: "Invalid tournament id",
      });
    }

    await assertHostTournament(tournamentId, req.user.id);

    const uniqueIds = [
      ...new Set(
        (registrationIds || [])
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      ),
    ];
    const regs = await PlayerRegistration.findAll({
      where: { id: { [Op.in]: uniqueIds }, tournamentId },
      transaction: t,
    });

    const allUpdated = [];
    const processed = new Set();

    for (const reg of regs) {
      if (processed.has(reg.id)) continue;
      const batch = await applyPaymentStatusToRegistration(
        reg,
        paymentStatus,
        syncPartner,
        tournamentId,
        t
      );
      for (const u of batch) {
        processed.add(u.registrationId);
        allUpdated.push(u);
      }
    }

    await t.commit();

    res.status(200).json({
      code: 200,
      error: false,
      message: `Updated payment status for ${allUpdated.length} registration(s)`,
      data: { updated: allUpdated },
    });
  } catch (error) {
    await safeRollback(t);
    res.status(error.status || 500).json({
      code: error.status || 500,
      error: true,
      message: error.message || "Failed to update payment status",
    });
  }
};

export default {
  getBracketMeta,
  listDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  bulkUploadPlayers,
  resendPaymentEmails,
  updateRegistration,
  updateRegistrationPayment,
  bulkUpdateRegistrationPayments,
};
