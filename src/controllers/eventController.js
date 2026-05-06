import models from "../models/Associations.js";

const { Event } = models;

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json({
      error: false,
      code: 200,
      data: events,
      message: "events fetched",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default { getAllEvents };
