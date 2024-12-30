export default {
    root: './storage',
    login: {
        providers: ['Discord', 'GitHub'] as const,
        users: {
            server: {
                displayName: 'Server Admin',
                email: 'server',
                avatar: '/images/icon.png',
            },
            example: {
                displayName: 'Example User',
                email: 'this email cannot exist! @ cloudvoxel',
            }
        },
    },
    database: {
        file: 'file:data/db.sqlite',
        globFileBlacklist: ['.DS_Store', 'thumbs.db', 'desktop.ini']
    },
} satisfies CloudConfig;