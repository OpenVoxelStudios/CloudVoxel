import { FilePond, registerPlugin } from 'react-filepond';

import 'filepond/dist/filepond.min.css';

import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateSize);

// TODO: Add the "undo/delete" feature
export default function FileUploadArea({ server }: { server: string }) {
    return (
        <FilePond
            allowMultiple={true}
            maxFiles={1}
            server={{
                process: {
                    url: server,
                    method: 'POST',
                    withCredentials: true,
                },
            }}
            name="files"
            labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            credits={false}
            maxFileSize={'1000MB'}
        />
    )
};