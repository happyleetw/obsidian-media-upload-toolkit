import MediaUploader from "../imageUploader";
import AWS from 'aws-sdk';
import {UploaderUtils} from "../uploaderUtils";

export default class R2Uploader implements MediaUploader {
  private readonly r2!: AWS.S3;
  private readonly bucket!: string;
  private pathTmpl: string;
  private customDomainName: string;

  constructor(setting: R2Setting) {
    this.r2 = new AWS.S3({
      accessKeyId: setting.accessKeyId,
      secretAccessKey: setting.secretAccessKey,
      endpoint: setting.endpoint,
      region: 'auto', // Cloudflare R2 uses 'auto' region
      s3ForcePathStyle: true, // Needed for Cloudflare R2
      signatureVersion: 'v4', // Cloudflare R2 uses v4 signatures
    });
    this.bucket = setting.bucketName;
    this.pathTmpl = setting.path;
    this.customDomainName = setting.customDomainName;
  }

  async upload(media: File, fullPath: string, notePath?: string): Promise<string> {
    const arrayBuffer = await this.readFileAsArrayBuffer(media);
    const uint8Array = new Uint8Array(arrayBuffer);
    var path = UploaderUtils.generateName(this.pathTmpl, media.name, notePath);
    path = path.replace(/^\/+/, ''); // remove the /
    const params = {
      Bucket: this.bucket,
      Key: path,
      Body: uint8Array,
      ContentType: `image/${media.name.split('.').pop()}`,
    };
    return new Promise((resolve, reject) => {
      this.r2.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const dst = data.Location.split(`/${this.bucket}/`).pop();
          resolve(UploaderUtils.customizeDomainName(dst, this.customDomainName));
        }
      });
    });
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

export interface R2Setting {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucketName: string;
  path: string;
  customDomainName: string;
}