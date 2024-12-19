export default {
    login: {
        providers: ['Discord', 'GitHub'] as const,
        whitelist: ["contact@openvoxel.studio"],
        users: {
            example: {
                displayName: 'Example User',
                email: 'this email cannot exist! @ cloudvoxel',
            }
        },
    },
} satisfies {
    login: {
        providers: readonly ['Discord', 'GitHub'],
        whitelist: string[],
        users: Record<string, {
            displayName: string;
            email: string;
        }>,
    }
}