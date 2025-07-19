import {App, Editor, FileSystemAdapter, MarkdownView, normalizePath, Notice} from "obsidian";
import path from "path";
import MediaUploader from "./imageUploader";
import {PublishSettings} from "../publish";
import UploadProgressModal from "../ui/uploadProgressModal";

const MD_REGEX = /\!\[(.*)\]\((.*?\.(png|jpg|jpeg|gif|svg|webp|excalidraw|mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|ogv))\)/g;
const WIKI_REGEX = /\!\[\[([^\]]*?\.(png|jpg|jpeg|gif|svg|webp|excalidraw|mp4|avi|mov|wmv|flv|webm|mkv|m4v|3gp|ogv))(\|[^\]]*)?\]\]/g;
const PROPERTIES_REGEX = /^---[\s\S]+?---\n/;

interface Media {
    name: string;
    path: string;
    url: string;
    source: string;
}

// Return type for resolveImagePath method
interface ResolvedImagePath {
    resolvedPath: string;
    name: string;
}

export const ACTION_PUBLISH: string = "PUBLISH";

export default class ImageTagProcessor {
    private readonly app: App;
    private readonly imageUploader: MediaUploader;
    private settings: PublishSettings;
    private adapter: FileSystemAdapter;
    private progressModal: UploadProgressModal | null = null;
    private readonly useModal: boolean = true; // Set to true to use modal, false to use status bar

    constructor(app: App, settings: PublishSettings, imageUploader: MediaUploader, useModal: boolean = true) {
        this.app = app;
        this.adapter = this.app.vault.adapter as FileSystemAdapter;
        this.settings = settings;
        this.imageUploader = imageUploader;
        this.useModal = useModal;
    }

    public async process(action: string): Promise<void> {
        let value = this.getValue();
        const basePath = this.adapter.getBasePath();
        const promises: Promise<Media>[] = [];
        const images = this.getImageLists(value);
        const uploader = this.imageUploader;
        
        // Get current note path for R2 path generation
        const activeFile = this.app.workspace.getActiveFile();
        const notePath = activeFile ? activeFile.path : '';
        
        console.log(`[ImageTagProcessor] 找到 ${images.length} 個媒體文件:`);
        images.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.name} (${img.path}) - 來源: "${img.source}"`);
        });
        
        // Initialize progress display
        if (this.useModal && images.length > 0) {
            this.progressModal = new UploadProgressModal(this.app);
            this.progressModal.open();
            this.progressModal.initialize(images);
        }
        
        for (const image of images) {
            if (this.app.vault.getAbstractFileByPath(normalizePath(image.path)) == null) {
                new Notice(`Can NOT locate ${image.name} with ${image.path}, please check image path or attachment option in plugin setting!`, 10000);
                console.log(`${normalizePath(image.path)} not exist`);
                // Update the progress modal with the failure
                if (this.progressModal) {
                    this.progressModal.updateProgress(image.name, false);
                }
                continue; // Skip to the next image
            }
            
            try {
                const buf = await this.adapter.readBinary(image.path);
                promises.push(new Promise<Media>((resolve, reject) => {
                    uploader.upload(new File([buf], image.name), basePath + '/' + image.path, notePath)
                        .then(imgUrl => {
                            image.url = imgUrl;
                            // Update progress on successful upload
                            if (this.progressModal) {
                                this.progressModal.updateProgress(image.name, true);
                            }
                            resolve(image);
                        })
                        .catch(e => {
                            // Also update progress on failed upload
                            if (this.progressModal) {
                                this.progressModal.updateProgress(image.name, false);
                            }
                            const errorMessage = `Upload ${image.path} failed, remote server returned an error: ${e.error || e.message || e}`;
                            new Notice(errorMessage, 10000);
                            reject(new Error(errorMessage));
                        });
                }));
            } catch (error) {
                console.error(`Failed to read file: ${image.path}`, error);
                new Notice(`Failed to read file: ${image.path}`, 5000);
            }
        }

        if (promises.length === 0) {
            if (this.progressModal) {
                this.progressModal.close();
            }
            new Notice("No images found or all images failed to process", 3000);
            return;
        }

        return Promise.all(promises.map(p => p.catch(e => {
            console.error(e);
            return null; // Return null for failed promises to continue processing
        }))).then(results => {
            // Modal will auto-close when all uploads complete
            // Filter out null results from failed promises
            const successfulImages = results.filter(img => img !== null) as Media[];
            
            console.log(`[ImageTagProcessor] 上傳結果: ${successfulImages.length}/${promises.length} 成功`);
            
            let altText;
            let replacementCount = 0;
            
            for (const image of successfulImages) {
                // 確保 image.url 不為空
                if (!image.url) {
                    console.warn(`[ImageTagProcessor] 警告: ${image.name} 的 URL 為空，跳過替換`);
                    continue;
                }
                
                altText = this.settings.imageAltText ? 
                    path.parse(image.name)?.name?.replaceAll("-", " ")?.replaceAll("_", " ") : 
                    '';
                
                const newMarkdown = `![${altText}](${image.url})`;
                
                // 檢查是否能找到要替換的內容
                if (value.includes(image.source)) {
                    console.log(`[ImageTagProcessor] 替換: "${image.source}" -> "${newMarkdown}"`);
                    value = value.replaceAll(image.source, newMarkdown);
                    replacementCount++;
                } else {
                    console.warn(`[ImageTagProcessor] 警告: 找不到要替換的內容: "${image.source}"`);
                    // 嘗試調試 - 顯示當前內容的一部分來幫助診斷
                    console.warn(`[ImageTagProcessor] 當前內容包含的類似字串:`, 
                        value.split('\n').filter(line => line.includes(image.name)).slice(0, 3));
                }
            }
            
            console.log(`[ImageTagProcessor] 總共替換了 ${replacementCount} 個鏈接`);
            
            if (this.settings.replaceOriginalDoc && this.getEditor()) {
                this.getEditor()?.setValue(value);
            }
            
            if (this.settings.ignoreProperties) {
                value = value.replace(PROPERTIES_REGEX, '');
            }
            
            switch (action) {
                case ACTION_PUBLISH:
                    navigator.clipboard.writeText(value);
                    new Notice(`Copied to clipboard (${replacementCount}/${images.length} images processed)`);
                    break;
                // more cases
                default:
                    throw new Error("invalid action!");
            }
        });
    }

    private getImageLists(value: string): Media[] {
        const images: Media[] = [];
        
        try {
            const wikiMatches = value.matchAll(WIKI_REGEX);
            for (const match of wikiMatches) {
                this.processMatched(match[1], match[0], images);
            }
            
            const mdMatches = value.matchAll(MD_REGEX);
            for (const match of mdMatches) {
                // Skip external images
                if (match[2].startsWith('http://') || match[2].startsWith('https://')) {
                    continue;
                }
                const decodedName = decodeURI(match[2]);
                this.processMatched(decodedName, match[0], images);

            }
        } catch (error) {
            console.error("Error processing image lists:", error);
        }
        
        return images;
    }

    private processMatched(path: string, src: string, images: Media[]){    
        try {
            const {resolvedPath, name} = this.resolveImagePath(path);
            // check the item with same resolvedPath 
            const existingImage = images.find(image => image.path === resolvedPath);
            if (!existingImage) {
                images.push({
                    name,
                    path: resolvedPath,
                    source: src,
                    url: '',
                });
            }
        }catch (error) {
            console.error(`Failed to process image: ${src}`, error);
        }
    }

    private resolveImagePath(imageName: string): ResolvedImagePath {
        let pathName = imageName.endsWith('.excalidraw') ?
            imageName + '.png' : 
            imageName;

        if(pathName.indexOf('/') < 0) {
            // @ts-ignore: config is not defined in vault api, but available
            const attachmentFolderPath = this.app.vault.config.attachmentFolderPath;
            pathName = path.join(attachmentFolderPath, pathName);
            if (attachmentFolderPath.startsWith('.')) {
                pathName = './' + pathName;
            }
        } else {
            imageName = imageName.substring(pathName.lastIndexOf('/') + 1);
        }

        if (pathName.startsWith('./')) {
            pathName = pathName.substring(2);
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile || !activeFile.parent) {
                throw new Error("No active file found");
            }
            const parentPath = activeFile.parent.path;
            return {resolvedPath: path.join(parentPath, pathName), name: imageName};
        } else {
            return {resolvedPath: pathName, name: imageName};
        }
    }

    private getValue(): string {
        const editor = this.getEditor();
        return editor ? editor.getValue() : "";
    }

    private getEditor(): Editor | null {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        return activeView ? activeView.editor : null;
    }
}