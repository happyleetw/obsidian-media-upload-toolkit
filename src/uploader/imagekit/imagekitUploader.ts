import MediaUploader from "../imageUploader";
import Imagekit from "imagekit";
import {UploaderUtils} from "../uploaderUtils";

export default class ImagekitUploader implements MediaUploader {
    private readonly imagekit!: Imagekit;
    private readonly setting!: ImagekitSetting;

    constructor(setting: ImagekitSetting) {
        this.imagekit = new Imagekit({
            publicKey: setting.publicKey,
            privateKey: setting.privateKey,
            urlEndpoint: setting.endpoint,
        });
        this.setting = setting;
    }
    async upload(media: File, fullPath: string, notePath?: string): Promise<string> {
        const result = await this.imagekit.upload({
            file : Buffer.from((await media.arrayBuffer())).toString('base64'),   //required
            fileName : media.name,   //required
            folder: UploaderUtils.generateName(this.setting.folder || '/', media.name, notePath),
            extensions: [
                {
                    name: "google-auto-tagging",
                    maxTags: 5,
                    minConfidence: 95
                }
            ]
        });

        return result.url;
    }
}


export interface ImagekitSetting {
    folder: string;
    imagekitID: string;
    publicKey: string;
    privateKey: string;
    endpoint: string;
}