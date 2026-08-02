import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { IFormXmlCell, IFormXmlCellEvents, IFormXmlControl, IFormXmlModel, MetadataFormXmlCell, MetadataFormXmlLabels, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue } from "./interfaces";
import { FormXmlControl } from "./FormXmlControl";

export class FormXmlCell implements IFormXmlCell {
    public formXmlModel: IFormXmlModel;
    public id?: string | undefined;
    public showlabel?: boolean | undefined;
    public labelid?: string | undefined;
    public locklevel?: number | undefined;
    public rowspan?: number | undefined;
    public colspan?: number | undefined;
    public userspacer?: boolean | undefined;
    public ispreviewcell?: boolean | undefined;
    public visible?: boolean | undefined;
    public availableforphone?: boolean | undefined;
    public isstreamcell?: boolean | undefined;
    public ischartcell?: boolean | undefined;
    public istilecell?: boolean | undefined;
    public labels?: MetadataFormXmlLabels | undefined;
    public control?: IFormXmlControl;
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;
    public events: IEventEmitter<IFormXmlCellEvents> = new EventEmitter<IFormXmlCellEvents>();

    private _customLabel?: string;

    constructor(cell: MetadataFormXmlCell, formXmlModel: IFormXmlModel) {
        Object.assign(this, cell);
        this.formXmlModel = formXmlModel;
        this.control = cell.control ? new FormXmlControl(cell.control, this) : undefined;
    }

    public getLabel(): string | null {
        if (this.showlabel === false) return null;
        return this._customLabel ?? this.formXmlModel.getLocalizedLabel(this.labels);
    }

    public setVisible(visible: boolean): void {
        if (this.getVisible() === visible) {
            return;
        }

        this.visible = visible;
        this.events.dispatchEvent("onVisibilityChanged", visible);
    }

    public setLabel(label: string): void {
        if (this.getLabel() === label) {
            return;
        }

        this._customLabel = label;
        this.events.dispatchEvent("onLabelChanged", label);
    }

    public getVisible(): boolean {
        return this.visible ?? true;
    }
}
