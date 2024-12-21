export default {
    login: {
        providers: ['Discord', 'GitHub'] as const,
        users: {
            server: {
                displayName: 'Server',
                email: 'reserved name!@this email cannot exist!',
            },
            example: {
                displayName: 'Example User',
                email: 'this email cannot exist! @ cloudvoxel',
            }
        },
    },
    database: {
        globFileBlacklist: ['.DS_Store']
    },
} satisfies {
    login: {
        providers: readonly ['Discord', 'GitHub'],
        users: Record<string, {
            displayName: string;
            email: string;
        }>,
    },
    database: {
        globFileBlacklist: string[];
    },
}