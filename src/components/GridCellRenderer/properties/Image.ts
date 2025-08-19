import { File } from './File';

export class Image extends File {
    public getImageThumbnailUrl(): string {
        const value = this.getValue();
        let src = value.thumbnailUrl;
        if (this.getClient().isTalxisPortal()) {
            src = `data:${value.mimeType};base64,${value.fileContent}`
        }
        return src!;
    }
}