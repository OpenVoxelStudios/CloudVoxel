import { FilePond, registerPlugin } from 'react-filepond';
import { useToast } from '@/hooks/use-toast';

import 'filepond/dist/filepond.min.css';
import FilepondZipper from 'filepond-plugin-zipper';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileMetadata from 'filepond-plugin-file-metadata';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import clientconfig from '../../../clientconfig';

registerPlugin(FilepondZipper(), FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateSize, FilePondPluginFileMetadata);

export default function FileUploadArea({ server, fetchFiles }: { server: string, fetchFiles: () => Promise<void> }) {
    const { toast } = useToast();

    return (
        <FilePond
            allowRemove={false}
            allowRevert={false}
            allowMultiple={true}
            server={{
                process: {
                    url: server,
                    method: 'POST',
                    withCredentials: true,
                },
                remove: null,
                fetch: null,
                load: null,
                patch: null,
                restore: null,
                revert: null,
                /*
                async (filePath, load, error) => {
                    const res = await fetch(`/api/dashboard/${JSON.parse(filePath)}`, {
                        method: 'DELETE',
                    });

                    if (res.status == 200) {
                        fetchFiles();
                        toast({
                            title: `Deleted file successfully.`,
                        })
                        return load();
                    }

                    const json = await res.json();
                    toast({
                        title: `Could not delete this file.`,
                        description: `${json?.error || 'No error message'}`,
                        variant: 'destructive',
                    });
                    return error(`Could not delete file: ${json?.error || 'No error message'}`)
                }
                */
            }}
            onprocessfile={fetchFiles}
            onerror={(error, file) => {
                toast({
                    title: `Error while uploading "${file?.filename}".`,
                    description: `${error.body || 'No error message'}`,
                    variant: 'destructive',
                })
            }}
            name="files"
            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            credits={false}
            maxFileSize={clientconfig.maxFileSize.replaceAll(' ', '')}
            maxFiles={clientconfig.maxFileCount}
            instantUpload={clientconfig.instantUpload}
            maxParallelUploads={clientconfig.maxParallelUploads}
            allowImagePreview={clientconfig.allowImagePreview}
            allowFileMetadata={clientconfig.allowFileMetadata}
        />
    )
};