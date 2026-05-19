import models from "../models/Associations.js"
import prisma from "../config/prisma.js";

const { Player } = models; // ← change from User to Player

const normalizeGender = (g) => {
  if (!g) return null;
  const lower = g.toLowerCase();
  if (lower === "m" || lower === "male") return "M";
  if (lower === "f" || lower === "female") return "F";
  return null;
};
const parseDate = (d) => {
  if (!d) return null;
  const parts = d.split("/");
  if (parts.length !== 3) return null;
  const [month, day, year] = parts;
  if (!month || !day || !year) return null;
  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`);
  if (isNaN(date.getTime())) return null;
  return date;
};

const importPlayers = async (req, res) => {
  try {

    const { players } = req.body;

    if (!players || !Array.isArray(players) || players.length === 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "No players provided.",
      });
    }

    const results = { inserted: [], skipped: [], failed: [] };

    for (const player of players) {
      try {
        const isValid =(!player.email || !player.email.toLowerCase().includes("@") || !player.email.toLowerCase().includes(".com"))? 0 : 1;
        const newPlayer = await prisma.player.upsert({
          where: { frontendId: player.id },
            update: {
              initials:    player.initials    || null,
              avatar:      player.avatar      || null,
              name:        player.name,
              gender:      normalizeGender(player.gender),
              age:         player.age         || null,
              date:        parseDate(player.date),
              phone:       player.phone       || null,
              partner:     player.partner     || null,
              partnerId:   player.partnerId   || null,
              division:    player.division    || null,
              dupr:        player.dupr        || null,
              paid:        player.paid        || null,
              paidClass:   player.paidClass   || null,
              status:      player.status      || null,
              statusClass: player.statusClass || null,
              email:       player.email,
              isValid,
  },
          create: {
            initials:   player.initials   || null,
            avatar:     player.avatar     || null,
            name:       player.name,
            frontendId: player.id,
            email:      player.email,
            gender:     normalizeGender(player.gender),
            age:        player.age        || null,
            date:       parseDate(player.date),
            phone:      player.phone      || null,
            partner:    player.partner    || null,
            partnerId:  player.partnerId  || null,
            division:   player.division   || null,
            dupr:       player.dupr       || null,
            paid:       player.paid       || null,
            paidClass:  player.paidClass  || null,
            status:     player.status     || null,
            statusClass: player.statusClass || null,
            isValid,
          },
        });
        if(isValid === 0){
          results.failed.push({name: player.name, reason: "Invalid email"});
        }
        else{
           results.inserted.push({ id: newPlayer.id, name: player.name });

        }
      } catch (err) {
        results.failed.push({ name: player.name, reason: err.message });
      }
    }

    return res.status(200).json({
      error: false,
      code: 200,
      message: `Import complete. ${results.inserted.length} inserted, ${results.skipped.length} skipped, ${results.failed.length} failed.`,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};
const getPlayers = async (req, res) => {
  try {
   const players = await prisma.player.findMany({
      select: { id: true, name: true, email: true, phone: true },
    });

    return res.status(200).json({
      error: false,
      code: 200,
      data: players,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};


export default { importPlayers, getPlayers };

