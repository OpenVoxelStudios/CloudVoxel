import { NextRequest as DefaultNextRequest } from 'next/server'
import { DefaultSession } from 'next-auth'

declare global {
    interface NextRequest extends DefaultNextRequest {
        auth: Session | null
    }

    interface Session extends DefaultSession {
        hasPasskey?: boolean;
    }

    interface CloudConfig {
        /**
         * @param string The root path of the storage directory
         * @param other A list of partitions with their own paths and own separate permissions
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
        /**
         * A list of providers users will be able to use to log in
         */
        providers: ("Discord" | "GitHub" | "GitLab" | "Google" | "Osu!" | "Slack" | "Twitch" | "Reddit")[];
        database: {
            /**
             * Should start with "file:" followed by the path to the database file
             */
            file: string;
            /**
             * A list of glob patterns to blacklist from the database (or just file names)
             */
            globFileBlacklist: string[];
        },
        /**
         * Whether to enable the API or not
         * @note It will not disable the /api page, only disable the API itself
         */
        enableAPI: boolean;
        /**
         * Whether to enable experimental passkeys or not
         * @see https://authjs.dev/getting-started/authentication/webauthn
         */
        enableExperimentalPasskeys?: boolean;
        /**
         * Whether to enable credential login or not
         * @note Only users with a defined password will be able to log in using this method
         */
        credentialLogin: boolean;
        logs: {
            /**
             * Whether to log to the console or not
             * @note Will still log if in dev mode
             */
            console: boolean;
            /**
             * The folder containing the log files
             */
            folder: string | false;
            /**
             * A file format string to use for the log files
             * @example 'YYYY-MM-DD.log'
             * @example 'YY-MM-DD HHh.txt'
             * @help YYYY: full year
             * @help YY: two last year digits
             * @help MM: month
             * @help DD: day
             * @help HH: hours
             */
            fileFormat: string;
        };
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