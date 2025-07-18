import { ILinkProps } from "@fluentui/react";
import { GridCellRendererModel } from "../GridCellRendererModel";

export class Property {
    private _model: GridCellRendererModel;

    constructor(model: GridCellRendererModel) {
        this._model = model;
    }
    public getLinkProps(): ILinkProps | null {
        if (this._model.getColumn().isPrimary) {
            return {
                target: "_blank",
                rel: "noopener noreferrer",
                children: this._model.getFormattedValue(),
                onClick: () => this._onClick()
            }
        }
        else {
            return null;
        }
    }
    public getFileAttachmentIcon(): string | undefined {
        return undefined;
    }
    public getImageThumbnailUrl(): string | null {
        return null;
    }
    public getColorfulOptionSet(): ComponentFramework.PropertyHelper.OptionMetadata[] | null {
        return null;
    }
    public isMultiline(): boolean {
        return false;
    }
    public async downloadPortalFile() {
        return;
    }
    public isFile(): boolean {
        return false;
    }
    public shouldUsePortalDownload(): boolean {
        return false;
    }
    public getModel() {
        return this._model;
    }
    public getValue(): any {
        return this._model.getValue();
    }
    public getFormattedValue(): any {
        return this._model.getFormattedValue();
    }
    private _onClick() {
        this._model.getDataset()?.openDatasetItem(this._model.getRecord().getNamedReference())
    }
}