import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { MetadataFormXmlControl, MetadataFormXmlLabels, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue, FormXmlControlParameters, IFormXmlCell, IFormXmlControl, IFormXmlControlEvents } from "./interfaces";

export class FormXmlControl implements IFormXmlControl {
    public readonly events: IEventEmitter<IFormXmlControlEvents> = new EventEmitter<IFormXmlControlEvents>();
    public id?: string | undefined;
    public uniqueid?: string | undefined;
    public classid?: string | undefined;
    public labelid?: string | undefined;
    public datafieldname?: string | undefined;
    public disabled?: boolean | undefined;
    public addedby?: string | undefined;
    public isunbound?: boolean | undefined;
    public isrequired?: boolean | undefined;
    public relationship?: string | undefined;
    public indicationOfSubgrid?: boolean | undefined;
    public labels?: MetadataFormXmlLabels | undefined;
    public parameters?: FormXmlControlParameters | undefined;
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;

    private _cell: IFormXmlCell;

    constructor(control: MetadataFormXmlControl, cell: IFormXmlCell) {
        Object.assign(this, control);
        this._cell = cell;
    }

    public getDisabled(): boolean {
        return this.disabled ?? false;
    }

    public setDisabled(disabled: boolean): void {
        if (this.getDisabled() === disabled) return;
        this.disabled = disabled;
        this.events.dispatchEvent("onDisabledChanged", disabled);
    }

    public getCell(): IFormXmlCell {
        return this._cell;
    }
}
