export default {
    login: {
        providers: ['Discord', 'GitHub'] as const,
        whitelist: ["contact@openvoxel.studio"],
    },
} as {
    login: {
        // credentials?: {
        //     username: string;
        //     password: string;
        // }[],
        providers: readonly ['Discord', 'GitHub'],
        whitelist: string[],
    }
}