export default {
    root: './storage',
    providers: ['Discord', 'GitHub'] as const,
    database: {
        file: 'file:data/db.sqlite',
        globFileBlacklist: ['.DS_Store', 'thumbs.db', 'desktop.ini']
    },
    enableAPI: true
} as CloudConfig;