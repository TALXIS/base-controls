import { ILinkProps } from "@fluentui/react";
import { Property } from "./Property";
import { Attribute, Client, FetchXmlDataProvider, FileAttribute, SinglePromiseExecutor } from "@talxis/client-libraries";


interface IFileObject extends ComponentFramework.FileObject {
    fileUrl: string;
    thumbnailUrl?: string;
}

export class File extends Property {
    private _client: Client = new Client();
    public getLinkProps(): ILinkProps {
        return {
            href: this.getValue().fileUrl,
            download: this.getValue().fileName,
            target: "_blank",
            rel: "noopener noreferrer",
            children: this.getValue().fileName
        };
    }

    public getValue(): IFileObject {
        return super.getValue();
    }
    public isFile(): boolean {
        return true;
    }
    public getClient(): Client {
        return this._client;
    }
    public shouldUsePortalDownload(): boolean {
        const isFetchXmlDataProvider = this.getModel().getDataset().getDataProvider() instanceof FetchXmlDataProvider;
        //only use portal download if within portal, uses fetch xml provider and is not virtual column
        if (this._client.isTalxisPortal() && isFetchXmlDataProvider && !this.getModel().getColumn().isVirtual) {
            return true;
        }
        return false;
    }

    public getFileAttachmentIcon(): string {
        const mimeType = this.getValue().mimeType
        if (!mimeType) {
            return 'Attach';
        }
        const icon_classes: any = {
            image: "Photo2",
            audio: "MusicNote",
            video: "Video",
            "application/pdf": "PDF",
            "application/msword": "WordDocument",
            "application/vnd.ms-word": "WordDocument",
            "application/vnd.oasis.opendocument.text": "WordDocument",
            "application/vnd.openxmlformats-officedocument.wordprocessingml": "WordDocument",
            "application/vnd.ms-excel": "ExcelDocument",
            "application/vnd.openxmlformats-officedocument.spreadsheetml": "ExcelDocument",
            "application/vnd.oasis.opendocument.spreadsheet": "ExcelDocument",
            "application/vnd.ms-powerpoint": "PowerPointDocument",
            "application/vnd.openxmlformats-officedocument.presentationml": "PowerPointDocument",
            "application/vnd.oasis.opendocument.presentation": "PowerPointDocument",
            "text/plain": "TextDocument",
            "text/html": "FileCode",
            "application/json": "FileCode",
            // Archives
            "application/gzip": "ZipFolder",
            "application/zip": "ZipFolder"
        };

        if (icon_classes[mimeType]) {
            return icon_classes[mimeType];
        }
        else if (icon_classes[mimeType.split("/")[0]]) {
            return icon_classes[mimeType.split("/")[0]];
        }
        return 'Attach';
    }

    public async downloadPortalFile() {
        const record = this.getModel().getRecord();
        const column = this.getModel().getColumn();
        return SinglePromiseExecutor.execute(`downloadPortalFile_${record.getRecordId()}_${column.name}`, async () => {
            const context = this.getModel().getContext();
            const storage = new FileAttribute(context.webAPI);
            const dataset = this.getModel().getDataset();
            let recordId = record.getRecordId();
            let entityName = dataset.getTargetEntityType();
            let attributeName = Attribute.GetNameFromAlias(column.name);
            const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);

            if (entityAliasName) {
                entityName = dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
                const entityMetadata = await context.utils.getEntityMetadata(entityName, []);
                recordId = record.getRawData()![`${entityAliasName}.${entityMetadata.PrimaryIdAttribute}`];
            }
            await storage.downloadFileFromAttribute({
                entityName: entityName,
                recordId: recordId,
                fileAttribute: attributeName
            }, true, undefined, {
                fileName: this.getValue().fileName,
                fileSizeInBytes: this.getValue().fileSize
            })
        })
    }
}