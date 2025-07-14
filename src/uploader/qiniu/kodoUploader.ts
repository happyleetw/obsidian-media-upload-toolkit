import MediaUploader from "../imageUploader";
import qiniu from "qiniu";
import {UploaderUtils} from "../uploaderUtils";

export default class KodoUploader implements MediaUploader {

    private uploadToken: string;
    private tokenExpireTime: number;
    private setting: KodoSetting;

    constructor(setting: KodoSetting) {
        this.setting = setting;
    }

    async upload(media: File, path: string, notePath?: string): Promise<string> {
        //check custom domain name
        if (!this.setting.customDomainName || this.setting.customDomainName.trim() === "") {
            throw new Error("Custom domain name is required for Qiniu Kodo.")
        }
        this.updateToken();
        const config = new qiniu.conf.Config();
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        let key = UploaderUtils.generateName(this.setting.path, media.name.replaceAll(' ', '_'), notePath); //replace space with _ in file name
        return formUploader
            .putFile(this.uploadToken, key, path, putExtra)
            .then(({data, resp}) => {
                if (resp.statusCode === 200) {
                    return this.setting.customDomainName + '/' + data.key;
                } else {
                    throw data;
                }
            })
            .catch((err) => {
                throw err
            });
    }

    updateToken(): void {
        if (this.tokenExpireTime && this.tokenExpireTime > Date.now()) {
            return;
        }
        const mac = new qiniu.auth.digest.Mac(this.setting.accessKey, this.setting.secretKey);
        const expires = 3600;
        this.tokenExpireTime = Date.now() + expires * 1000;
        const options = {
            scope: this.setting.bucket,
            expires: expires,
            returnBody:
                '{"key":"$(key)","hash":"$(etag)","bucket":"$(bucket)","name":"$(x:name)","age":$(x:age)}',
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        this.uploadToken = putPolicy.uploadToken(mac);
    }
}

export interface KodoSetting {
    accessKey: string;
    secretKey: string;
    bucket: string;
    customDomainName: string;
    path: string;
}