import path from "path";

export class UploaderUtils {
    static generateName(pathTmpl, imageName: string, notePath?: string): string {
        const date = new Date();
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = this.generateRandomString(20);
        
        // Extract top-level folder name from note path
        const topLevelFolder = this.getTopLevelFolder(notePath);

        return pathTmpl != undefined && pathTmpl.trim().length > 0 ? pathTmpl
                .replace('{year}', year)
                .replace('{mon}', month)
                .replace('{day}', day)
                .replace('{random}', random)
                .replace('{filename}', imageName)
                .replace('{path}', topLevelFolder)
            : imageName
            ;
    }

    private static generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }

        return result;
    }

    private static getTopLevelFolder(notePath?: string): string {
        if (!notePath) {
            return '';
        }
        
        // Remove leading and trailing slashes
        const cleanPath = notePath.replace(/^\/+|\/+$/g, '');
        
        // Split by path separator and get the first part
        const pathParts = cleanPath.split('/');
        
        // Return the top-level folder name, or empty string if no folder structure
        return pathParts.length > 0 ? pathParts[0] : '';
    }

    static customizeDomainName(url, customDomainName) {
        const regex = /https?:\/\/([^/]+)/;
        customDomainName = customDomainName.replaceAll('https://', '')
        if (customDomainName && customDomainName.trim() !== "") {
            if (url.match(regex) != null) {
                return url.replace(regex, (match, domain) => {
                    return match.replace(domain, customDomainName);
                })
            } else {
                return `https://${customDomainName}/${url}`;
            }
        }
        return url;
    }
}