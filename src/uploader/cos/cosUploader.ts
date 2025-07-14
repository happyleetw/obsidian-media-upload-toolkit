import COS from "cos-nodejs-sdk-v5"
import MediaUploader from "../imageUploader";
import {UploaderUtils} from "../uploaderUtils";

export default class CosUploader implements MediaUploader {

    private readonly client!: COS;
    private readonly pathTmpl: String;
    private readonly customDomainName: String;
    private readonly region: string;
    private readonly bucket: string;

    constructor(setting: CosSetting) {
        this.client = new COS({
            SecretId: setting.secretId,
            SecretKey: setting.secretKey,
        })
        this.pathTmpl = setting.path;
        this.customDomainName = setting.customDomainName;
        this.bucket = setting.bucket;
        this.region = setting.region;
    }

    async upload(media: File, fullPath: string, notePath?: string): Promise<string> {
        const result = this.client.putObject({
            Body: Buffer.from((await media.arrayBuffer())),
            Bucket: this.bucket,
            Region: this.region,
            Key: UploaderUtils.generateName(this.pathTmpl, media.name, notePath),
        });
        var url = 'https://' + (await result).Location;
        return UploaderUtils.customizeDomainName(url, this.customDomainName);
    }

}

export interface CosSetting {
    region: string;
    bucket: string;
    secretId: string;
    secretKey: string;
    path: string;
    customDomainName: string;
}