export default interface MediaUploader {
    upload(media: File, fullPath: string, notePath?: string): Promise<string>;
}

