export default {
    maxFileSize: '1000 MB',
    maxFileCount: 25,
    instantUpload: true,
    maxParallelUploads: 2,
    allowImagePreview: true,
} satisfies {
    maxFileSize: string;
    maxFileCount: number;
    instantUpload: boolean;
    maxParallelUploads: number;
    allowImagePreview: boolean;
}