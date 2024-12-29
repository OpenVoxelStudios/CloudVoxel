export default {
    websiteName: 'CloudVoxel',
    websiteURL: process.env.AUTH_URL || 'waaaaa NOOO THIS HSOULD BE DEFINIININEEed Uhhhmmm 🤓',
    websiteDescription: 'An Open-Source local-first solution to file sharing.',
    websiteLogo: '/images/logo.png',
    maxFileSize: '1000 MB',
    maxFileCount: 25,
    instantUpload: true,
    maxParallelUploads: 2,
    allowImagePreview: true,
} satisfies ClientConfig;