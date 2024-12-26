import { NextRequest as DefaultNextRequest } from 'next/server'
import { Session } from 'next-auth'

declare global {
    interface NextRequest extends DefaultNextRequest {
        auth: Session | null
    }

    interface CloudConfig {
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
}