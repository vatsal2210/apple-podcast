import express from "express";
import {
  scrapePodcast,
  searchPodcasts,
  searchEpisodesByPerson,
  getPodcastByGuid,
  getEpisodeById,
  downloadEpisode,
} from "../controller/podcastController";

const router = express.Router();

router.post("/scrape-podcast", scrapePodcast);
router.get("/search/title", searchPodcasts);
router.get("/search/person", searchEpisodesByPerson);
router.get("/podcast/:guid", getPodcastByGuid);
router.get("/episode/:id", getEpisodeById);
router.get("/download", downloadEpisode);

export default router;
