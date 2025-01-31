export default {
  root: "./storage",
  providers: [],
  database: {
    file: "file:data/db.sqlite",
    globFileBlacklist: [".DS_Store", "thumbs.db", "desktop.ini"],
  },
  enableAPI: true,
  enableExperimentalPasskeys: false,
  credentialLogin: true,
  logs: {
    console: true,
    folder: false,
    fileFormat: "YYYY-MM-DD.log",
  },
} satisfies CloudConfig as CloudConfig;
