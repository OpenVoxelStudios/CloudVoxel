export default {
  mainPageAllowed: true,
  websiteName: "CloudVoxel",
  websiteURL: process.env.AUTH_URL || "http://localhost:3000",
  websiteDescription: "An Open-Source local-first solution to file sharing.",
  websiteLogo: "/siteicon.png",
  maxFileSize: "1000 MB",
  maxFileCount: 25,
  instantUpload: true,
  maxParallelUploads: 2,
  allowImagePreview: false,
  allowFileMetadata: false,
} satisfies ClientConfig as ClientConfig;
