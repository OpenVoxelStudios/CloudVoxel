import { NextRequest as DefaultNextRequest } from 'next/server'
import { Session } from 'next-auth'

declare global {
    interface NextRequest extends DefaultNextRequest {
        auth: Session | null
    }

    interface CloudConfig {
        /**
         * @param string The root path of the storage directory.
         * @param other A list of partitions with their own paths and own separate permissions.
         */
        root: string | {
            [name: string]: ({
                defaultAccess: 'public';
            } | {
                defaultAccess: 'private';
                groupAccess: string[];
            }) & {
                displayName: string;
                path: string;
                maxPartitionSize?: string;
            }
        };
        providers: readonly ['Discord', 'GitHub'];
        database: {
            file: string;
            globFileBlacklist: string[];
        },
        enableAPI: boolean;
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
        allowFileMetadata: boolean;
    }
}