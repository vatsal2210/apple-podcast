import mongoose, { Document, Schema } from "mongoose";
import { EpisodeSchema, IEpisode } from "./Episodes";

export interface IPodcast extends Document {
  title: string;
  description: string;
  author: string;
  itunesId: number | null;
  itunesType: string;
  language: string;
  link: string;
  image: string;
  artwork: string;
  lastBuildDate: Date | null;
  itunesCategories: { [key: string]: string };
  generator: string;
  copyright: string;
  podcastGuid: string;
  ownerName: string;
  ownerEmail: string;
  explicit: boolean;
  episodeCount: number;
  feedUrl: string;
  episodes: IEpisode[];
  kind: string;
  itunesSummary: string;
  itunesSubtitle: string;
  persons: Array<{
    id: number;
    name: string;
    role: string;
    group: string;
    href: string;
    img: string;
  }>;
}

const PodcastSchema: Schema = new Schema({
  title: String,
  description: String,
  author: String,
  itunesId: Number,
  itunesType: String,
  language: String,
  link: String,
  image: String,
  artwork: String,
  lastBuildDate: Date,
  itunesCategories: { type: Map, of: String },
  generator: String,
  copyright: String,
  podcastGuid: String,
  ownerName: String,
  ownerEmail: String,
  explicit: Boolean,
  episodeCount: Number,
  feedUrl: String,
  episodes: [EpisodeSchema],
  kind: String,
  itunesSummary: String,
  itunesSubtitle: String,
  persons: [{
    id: Number,
    name: String,
    role: String,
    group: String,
    href: String,
    img: String,
  }],
});

export default mongoose.model<IPodcast>("Podcast", PodcastSchema);
