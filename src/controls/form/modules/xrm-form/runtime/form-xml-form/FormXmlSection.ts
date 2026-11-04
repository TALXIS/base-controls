import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { IFormXmlCell, IFormXmlControl, IFormXmlModel, IFormXmlSection, IFormXmlSectionEvents, MetadataFormXmlLabels, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue, MetadataFormXmlSection } from "./interfaces";
import { FormXmlCell } from "./FormXmlCell";

export class FormXmlSection implements IFormXmlSection {
    public id?: string | undefined;
    public formXmlModel: IFormXmlModel;
    public name?: string | undefined;
    public group?: string | undefined;
    public showlabel?: boolean | undefined;
    public labelid?: string | undefined;
    public showbar?: boolean | undefined;
    public columns?: string | undefined;
    public isuserdefined?: string | undefined;
    public height?: string | undefined;
    public locklevel?: number | undefined;
    public addedby?: string | undefined;
    public visible?: boolean | undefined;
    public autoexpand?: boolean | undefined;
    public labelwidth?: number | undefined;
    public availableforphone?: boolean | undefined;
    public celllabelalignment?: "Center" | "Left" | "Right" | undefined;
    public celllabelposition?: "Top" | "Left" | undefined;
    public rowheight?: number | undefined;
    public labels?: MetadataFormXmlLabels | undefined;
    public rows?: MetadataFormXmlSection["rows"];
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;
    public events: IEventEmitter<IFormXmlSectionEvents> = new EventEmitter<IFormXmlSectionEvents>();

    private _cells: IFormXmlCell[] = [];
    private _customLabel?: string;
    //the xsd has columns as number (1, 11, 111...)
    private _columnsString: string;

    constructor(section: MetadataFormXmlSection, formXmlModel: IFormXmlModel) {
        Object.assign(this, section);
        this.formXmlModel = formXmlModel;
        this._columnsString = section.columns?.toString() ?? '1';
        this._cells = section.rows?.row?.flatMap(row => row.cell?.map(cell => new FormXmlCell(cell, formXmlModel)) ?? []) ?? [];
        this._registerCellEvents(this._cells);
    }

    public getLabel(): string | null {
        if (this.showlabel === false) return null;
        return this._customLabel ?? this.formXmlModel.getLocalizedLabel(this.labels);
    }

    public getCells(): IFormXmlCell[] {
        return this._cells;
    }

    public getControls(): IFormXmlControl[] {
        return this._cells.filter(cell => cell.control).map(cell => cell.control!);
    }

    public getVisibleCells(): IFormXmlCell[] {
        return this._cells.filter(cell => cell.getVisible());
    }

    public getNumberOfColumns(): number {
        return this._columnsString.length;
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

    public getCellLabelPosition(): "Top" | "Left" {
        return this.celllabelposition ?? "Left";
    }

    private _registerCellEvents(cells: IFormXmlCell[]): void {
        for (const cell of cells) {
            cell.events.addEventListener("onVisibilityChanged", (visible) => {
                this.events.dispatchEvent("onCellVisibilityChanged", cell.id ?? "", visible);
            });
        }
    }
}
