import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import type { IFormXmlColumn, IFormXmlModel, IFormXmlSection, IFormXmlTab, IFormXmlTabEvents, MetadataFormXmlHeaderFooter, MetadataFormXmlLabels, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue, MetadataFormXmlTab } from "./interfaces";
import { FormXmlColumn } from "./FormXmlColumn";

export class FormXmlTab implements IFormXmlTab {
    public formXmlModel: IFormXmlModel;
    public events: IEventEmitter<IFormXmlTabEvents>;
    public group?: string | undefined;
    public name?: string | undefined;
    public verticallayout?: boolean | undefined;
    public showlabel?: boolean | undefined;
    public labelid?: string | undefined;
    public id: string;
    public IsUserDefined?: string | undefined;
    public locklevel?: number | undefined;
    public addedby?: string | undefined;
    public expanded?: boolean | undefined;
    public visible?: boolean | undefined;
    public availableforphone?: boolean | undefined;
    public collapsible?: boolean | undefined;
    public labels?: MetadataFormXmlLabels | undefined;
    public tabheader?: MetadataFormXmlHeaderFooter | undefined;
    public tabfooter?: MetadataFormXmlHeaderFooter | undefined;
    public columns: IFormXmlColumn[];
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;

    private _customLabel?: string;

    constructor(tab: MetadataFormXmlTab, formXmlModel: IFormXmlModel) {
        Object.assign(this, tab);
        this.formXmlModel = formXmlModel;
        this.events = new EventEmitter<IFormXmlTabEvents>();
        this.id = tab.id ?? tab.name ?? window.crypto.randomUUID();
        this.columns = tab.columns?.column?.map(col => new FormXmlColumn(col, formXmlModel)) ?? [];
        this._registerSectionEvents(this.getSections());
    }

    public getColumns(): IFormXmlColumn[] {
        return this.columns;
    }

    public getVisibleSections(): IFormXmlSection[] {
        return this.getColumns().flatMap(column => column.getVisibleSections());
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

    public getSections(): IFormXmlSection[] {
        return this.getColumns().flatMap(column => column.getSections());
    }

    public getVisible(): boolean {
        return this.visible ?? true;
    }

    public getExpanded(): boolean {
        return this.expanded ?? false;
    }

    public setExpanded(): void {
        this.formXmlModel.tabs.setExpandedTab(this.id);
    }

    public setLabel(label: string): void {
        if (this.getLabel() === label) {
            return;
        }

        this._customLabel = label;
        this.events.dispatchEvent("onLabelChanged", label);
        this.formXmlModel.requestRender();
    }

    private _registerSectionEvents(sections: IFormXmlSection[]): void {
        sections.map(section => {
            section.events.addEventListener("onVisibilityChanged", (visible) => {
                this.events.dispatchEvent("onSectionVisibilityChanged", section.id ?? "", visible);
            });
        });
    }
}
