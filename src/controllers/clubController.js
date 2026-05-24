import Club from "../models/Club.js";
import prisma from "../config/prisma.js";

const createClub = async (req, res) => {
  try {
    const { name, location, phoneNumber, clubType, clubLogo, description } =
      req.body;

    const newClub = await Club.create({
      name,
      location,
      phoneNumber,
      clubType,
      clubLogo,
      description,
      hostId: req.user.id,
    });

    res.status(201).json({
      error: false,
      code: 201,
      message: "Club created successfully",
      data: newClub,
    });
  } catch (error) {
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

// Get all clubs for the authenticated host (Prisma — same client as seed/sign-in)
const getAllClubs = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { search } = req.query;

    const clubs = await prisma.club.findMany({
      where: {
        hostId,
        ...(search?.trim()
          ? {
              name: {
                contains: search.trim(),
                mode: "insensitive",
              },
            }
          : {}),
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({ error: false, code: 200, data: clubs });
  } catch (error) {
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

// Get a single club by ID
const getClubById = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { id } = req.params;
    const club = await Club.findOne({
      where: { id, hostId },
      // include: {
      //   model: User,
      //   as: "host",
      //   attributes: ["id", "firstname", "lastname", "email"],
      // },
    });

    if (!club) {
      return res
        .status(404)
        .json({ error: true, code: 404, message: "Club not found" });
    }

    res.status(200).json({ error: false, code: 200, data: club });
  } catch (error) {
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

// Update a club (host only, must be owner)
const updateClub = async (req, res) => {
  try {
    const hostId = req.user.id;
    const { id } = req.params;
    const club = await Club.findByPk(id);

    if (!club)
      return res
        .status(404)
        .json({ error: true, code: 400, message: "Club not found" });

    if (!req.user.roles.includes("host") || req.user.id !== club.hostId) {
      return res
        .status(403)
        .json({ error: true, code: 403, message: "Not authorized" });
    }

    await club.update(req.body);

    res
      .status(200)
      .json({ error: false, code: 200, message: "Club updated", data: club });
  } catch (error) {
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

// Delete a club (host only, must be owner)
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const club = await Club.findByPk(id);

    if (!club)
      return res.status(404).json({ error: true, message: "Club not found" });

    if (!req.user.roles.includes("host") || req.user.id !== club.hostId) {
      return res.status(403).json({ error: true, message: "Not authorized" });
    }

    await club.destroy();
    res
      .status(200)
      .json({ error: false, message: "Club deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export default {
  createClub,
  updateClub,
  deleteClub,
  getAllClubs,
  getClubById,
};
