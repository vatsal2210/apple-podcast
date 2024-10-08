import mongoose, { Document, Schema } from "mongoose";

export interface IEpisode {
  title: string;
  description: string;
  pubDate: Date;
  duration: number;
  enclosureLength: number;
  enclosureType: string;
  enclosureUrl: string;
  episode: number;
  episodeType: string;
  explicit: number;
  guid: string;
  link: string;
  image: string;
  feedImage: string;
  feedItunesId: number;
  feedLanguage: string;
  transcripts: Array<{
    url: string;
    type: 'srt' | 'vtt' | 'text';
    language: string;
  }>;
  persons: Array<{
    id: number;
    name: string;
    role: string;
    group: string;
    href: string;
    img: string;
  }>;
}

export const EpisodeSchema: Schema = new Schema({
  title: String,
  description: String,
  pubDate: Date,
  duration: Number,
  enclosureLength: Number,
  enclosureType: String,
  enclosureUrl: String,
  episode: Number,
  episodeType: String,
  explicit: Number,
  guid: String,
  link: String,
  image: String,
  feedImage: String,
  feedItunesId: Number,
  feedLanguage: String,
  transcripts: [
    {
      url: String,
      type: {
        type: String,
        enum: ['srt', 'vtt', 'text'],
      },
      language: String,
    },
  ],
  persons: [
    {
      id: Number,
      name: String,
      role: String,
      group: String,
      href: String,
      img: String,
    },
  ],
});
