import {
  buildPublicDivisionDetail,
  buildPublicTournamentPage,
} from "../services/publicTournamentService.js";

const getPublicTournamentPage = async (req, res) => {
  try {
    const { slug } = req.params;
    const preview = req.query.preview === "1";
    const data = await buildPublicTournamentPage(slug, { preview });
    return res.status(200).json({
      code: 200,
      error: false,
      message: "Public tournament page fetched",
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      code: status,
      error: true,
      message: error.message || "Failed to fetch tournament page",
    });
  }
};

const getPublicDivisionDetail = async (req, res) => {
  try {
    const { slug, bracketId } = req.params;
    const preview = req.query.preview === "1";
    const data = await buildPublicDivisionDetail(slug, bracketId, { preview });
    return res.status(200).json({
      code: 200,
      error: false,
      message: "Division detail fetched",
      data,
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      code: status,
      error: true,
      message: error.message || "Failed to fetch division detail",
    });
  }
};

export default {
  getPublicTournamentPage,
  getPublicDivisionDetail,
};
