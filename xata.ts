// Generated by Xata Codegen 0.30.1. Please do not edit.
import { buildClient } from "@xata.io/client";
import type {
  BaseClientOptions,
} from "@xata.io/client";

export type DatabaseSchema = {};

const DatabaseClient = buildClient();

const defaultOptions = {
  databaseURL:
    "https://Ahmad-Imran-s-workspace-912d1d.eu-central-1.xata.sh/db/clip-sync",
    apiKey: process.env.XATA_API_KEY,
    branch: 'main',
};

export class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions) {
    super({ ...defaultOptions, ...options });
  }
}

let instance: XataClient | undefined = undefined;

export const getXataClient = () => {
  if (instance) return instance;

  instance = new XataClient();
  return instance;
};
