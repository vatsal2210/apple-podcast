// Ref: https://podcastindex.org/podcast/3673613?episode=27360051456

import { Request, Response } from "express";
import axios from "axios";
import xml2js from "xml2js";
import Podcast, { IPodcast } from "../models/Podcast";
import { IEpisode } from "../models/Episodes";
import { parseDuration } from "../utils";

const getPodcastMetadata = async (
  feedUrl: string,
  kind: string | null = null,
  itunesId: number | null = null,
  trackCount: number | null = 1
): Promise<{ podcast: Partial<IPodcast>; episodes: IEpisode[] }> => {
  try {
    const response = await axios.get(feedUrl);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    const channel = result.rss.channel;
    const itunesNs = channel["itunes:owner"];

    const podcast: Partial<IPodcast> = {
      title: channel.title.trim(),
      description: channel.description.trim(),
      author: channel["itunes:author"],
      itunesId: itunesId,
      itunesType: channel["itunes:type"],
      language: channel.language,
      link: channel.link,
      image: channel.image.url,
      artwork: channel["itunes:image"].$.href,
      lastBuildDate: channel.lastBuildDate
        ? new Date(channel.lastBuildDate)
        : null,
      itunesCategories: parseItunesCategories(channel["itunes:category"]),
      generator: channel?.generator || null,
      copyright: channel?.copyright || null,
      podcastGuid: channel["podcast:guid"],
      ownerName: itunesNs["itunes:name"],
      ownerEmail: itunesNs["itunes:email"],
      explicit: channel["itunes:explicit"]?.toLowerCase() === "yes",
      episodeCount: Array.isArray(channel.item) ? channel.item.length : 1,
      feedUrl: feedUrl,
      kind: kind || "podcast",
      itunesSummary: channel["itunes:summary"],
      itunesSubtitle: channel["itunes:subtitle"],
      persons: parsePersons(channel["podcast:person"]),
    };

    const episodes: IEpisode[] = (
      Array.isArray(channel.item) ? channel.item : [channel.item]
    ).map((item: any) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      pubDate: new Date(item.pubDate),
      duration: parseDuration(item["itunes:duration"]),
      enclosureLength: parseInt(item.enclosure.$.length),
      enclosureType: item.enclosure.$.type,
      enclosureUrl: item.enclosure.$.url,
      episode: parseInt(item["itunes:episode"]) || trackCount,
      episodeType: item["itunes:episodeType"] || "full",
      explicit: item["itunes:explicit"]?.toLowerCase() === "yes" ? 1 : 0,
      guid: item.guid._ || item.guid,
      link: item.link,
      image: item["itunes:image"]?.$.href || podcast.image,
      feedImage: podcast.image,
      feedItunesId: podcast.itunesId,
      feedLanguage: podcast.language,
      chaptersUrl: item["podcast:chapters"]?.$.url || null,
      transcriptUrl: item["podcast:transcript"]?.$.url || null,
      persons: parsePersons(item["podcast:person"]),
    }));

    return { podcast, episodes };
  } catch (error) {
    console.error("Error fetching podcast metadata:");
    throw error;
  }
};

const parseItunesCategories = (categories: any): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  if (Array.isArray(categories)) {
    categories.forEach((category, index) => {
      result[index.toString()] = category.$.text;
      if (category["itunes:category"]) {
        result[(index + 1).toString()] = category["itunes:category"].$.text;
      }
    });
  } else if (categories) {
    result["0"] = categories.$.text;
    if (categories["itunes:category"]) {
      result["1"] = categories["itunes:category"].$.text;
    }
  }
  return result;
};

const parsePersons = (
  persons: any
): Array<{
  id: number;
  name: string;
  role: string;
  group: string;
  href: string;
  img: string;
}> => {
  if (!persons) return [];

  const personArray = Array.isArray(persons) ? persons : [persons];
  return personArray.map((person: any, index: number) => ({
    id: index + 1,
    name: person._,
    role: person.$.role?.toLowerCase() || "",
    group: person.$.group || "",
    href: person.$.href || "",
    img: person.$.img || "",
  }));
};

export const scrapePodcast = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.body;
    console.log("Received URL:", url);

    let feedUrl = url;
    let itunesId: number | null = null;
    let kind: string | null = null;
    let trackCount: number | null = 1;

    // Check if the URL is from Apple Podcasts
    if (url.includes("podcasts.apple.com")) {
      console.log("Apple Podcasts URL detected");
      const applePodcast = await getFeedUrlFromApplePodcasts(url);
      if (applePodcast) {
        feedUrl = applePodcast.feedUrl;
        itunesId = applePodcast.collectionId || null;
        kind = applePodcast.kind || null;
        trackCount = applePodcast.trackCount || null;
      }
    }

    // Check if the podcast already exists in the database
    let podcast = await Podcast.findOne({ feedUrl });

    if (podcast) {
      console.log("Podcast already exists in the database");
      // If podcast exists, return it without calling getPodcastMetadata
      res.json(podcast);
    } else {
      // If podcast doesn't exist, fetch metadata and create new podcast
      console.log("Podcast doesn't exist in the database");
      const { podcast: podcastMetadata, episodes } = await getPodcastMetadata(
        feedUrl,
        kind,
        itunesId,
        trackCount
      );

      podcast = new Podcast(podcastMetadata);
      podcast.episodes = episodes;
      await podcast.save();

      res.json(podcast);
    }
  } catch (error) {
    console.error("Error scraping podcast:");
    res.status(500).json({ error: (error as Error).message });
  }
};

async function getFeedUrlFromApplePodcasts(appleUrl: string): Promise<{
  feedUrl: string;
  collectionId: number | null;
  kind: string | null;
  trackCount: number | null;
} | null> {
  try {
    const match = appleUrl.match(/\/id(\d+)(?:\?i=(\d+))?/);
    if (!match) {
      throw new Error("Invalid podcast URL");
    }
    const podcastId = match[1];

    const response = await axios.get("https://itunes.apple.com/lookup", {
      params: { id: parseInt(podcastId), entity: "podcast" },
    });

    console.log(response.data.results[0]);

    return response.data.results[0];
  } catch (error) {
    console.error("Error fetching feed URL from itunes.com:", error);
    return null;
  }
}

export const searchPodcasts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { term } = req.query;
    const podcasts = await Podcast.find({
      $text: { $search: term as string },
    }).limit(20);
    res.json(podcasts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const searchEpisodesByPerson = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { person } = req.query;
    const episodes = await Podcast.aggregate([
      { $unwind: "$episodes" },
      {
        $match: {
          "episodes.description": { $regex: person as string, $options: "i" },
        },
      },
      { $limit: 20 },
    ]);
    res.json(episodes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getPodcastByGuid = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { guid } = req.params;
    const podcast = await Podcast.findOne({ podcastGuid: guid });
    if (podcast) {
      res.json(podcast);
    } else {
      res.status(404).json({ error: "Podcast not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getEpisodeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findOne({ "episodes.guid": id });
    if (podcast) {
      const episode = podcast.episodes.find((ep) => ep.guid === id);
      res.json(episode);
    } else {
      res.status(404).json({ error: "Episode not found" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const downloadEpisode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { url } = req.query;
    if (!url || typeof url !== "string") {
      res.status(400).json({ error: "Invalid URL" });
      return;
    }

    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream",
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        url.split("/").pop() || "episode.mp3"
      )}"`
    );

    response.data.pipe(res);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
