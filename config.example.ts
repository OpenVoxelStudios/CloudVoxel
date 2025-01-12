export default {
    root: './storage',
    providers: ['Discord', 'GitHub'],
    database: {
        file: 'file:data/db.sqlite',
        globFileBlacklist: ['.DS_Store', 'thumbs.db', 'desktop.ini']
    },
    enableAPI: true,
    enableExperimentalPasskeys: false,
    credentialLogin: false,
} satisfies CloudConfig as CloudConfig;