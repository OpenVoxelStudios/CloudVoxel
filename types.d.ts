import { NextRequest as DefaultNextRequest } from 'next/server'
import { Session } from 'next-auth'

declare global {
    interface NextRequest extends DefaultNextRequest {
        auth: Session | null
    }

    interface CloudConfig {
        root: string;
        login: {
            providers: readonly ['Discord', 'GitHub'];
            users: Record<string, {
                displayName: string;
                email: string;
                avatar?: string;
            }>
        };
        database: {
            file: string;
            globFileBlacklist: string[];
        }
    }

    interface ClientConfig {
        mainPageAllowed: boolean;
        websiteName: string;
        websiteDescription: string;
        websiteLogo: string;
        websiteURL: string;
        maxFileSize: string;
        maxFileCount: number;
        instantUpload: boolean;
        maxParallelUploads: number;
        allowImagePreview: boolean;
    }
}