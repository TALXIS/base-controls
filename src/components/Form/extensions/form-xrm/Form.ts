import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { parseFormXml, FormXml, FormXmlTabs, FormXmlTab, FormXmlOpaqueNode, FormXmlPrimitiveValue, FormXmlColumns, FormXmlEvents, FormXmlHeaderFooter, FormXmlLabels, FormXmlAncestor, FormXmlClientResources, FormXmlControlDescriptions, FormXmlDisplayConditions, FormXmlExternalDependencies, FormXmlFormParameters, FormXmlHiddenControls, FormXmlLibraryType, FormXmlNavigation, FormXmlOpaqueElement, FormXmlColumn, FormXmlSections, FormXmlSection, FormXmlCell, FormXmlControl, RequiredLevelEnum } from "@talxis/client-metadata";
import { IForm } from "../../Form";

const LCID_ENGLISH_US = 1033;

export interface IFormProps {
    formXml: string;
    form: IForm;
    lcid: number;
}


export interface ITabsEvents {
    onTabChange: (tabId: string) => void;
    onTabSetVisible: (tabId: string, visible: boolean) => void;
}

export interface ITabs extends Omit<FormXmlTabs, 'tab'> {
    tab: ITab[];
    events: IEventEmitter<ITabsEvents>;
    getExpandedTab: () => ITab;
    getVisibleTabs: () => ITab[];
    setExpandedTab: (tabId: string) => void;
}

export interface ITabEvents {
    onSetVisible: (visible: boolean) => void;
    onSectionSetVisible: (sectionId: string, visible: boolean) => void;
    onLabelSet: (label: string) => void;
}

export interface ITab extends Omit<FormXmlTab, 'events' | 'columns'> {
    id: string;
    form: IXrmForm;
    events: IEventEmitter<ITabEvents>;
    getLabel: () => string | null;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getColumns: () => IColumn[];
    getVisibleSections: () => ISection[];
    getSections: () => ISection[];

}

export interface ISectionEvents {
    onSetVisible: (visible: boolean) => void;
    onCellSetVisible: (cellId: string, visible: boolean) => void;
    onLabelSet: (label: string) => void;
}

export interface ISection extends Omit<FormXmlSection, 'events'> {
    events: IEventEmitter<ISectionEvents>;
    getLabel: () => string | null;
    getCells: () => ICell[];
    getVisibleCells: () => ICell[];
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getCellLabelPosition: () => "Top" | "Left";
}

export interface IColumn extends FormXmlColumn {
    getSections: () => ISection[];
    getVisibleSections: () => ISection[];
}

export interface ICellEvents {
    onSetVisible: (visible: boolean) => void;
    onLabelSet: (label: string) => void;
}

export interface ICell extends Omit<FormXmlCell, 'events'> {
    events: IEventEmitter<ICellEvents>;
    getLabel: () => string | null;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
}

export interface IControl extends FormXmlControl {
}

export class Control implements IControl {

    constructor(control: FormXmlControl, xrmForm: IXrmForm) {
        Object.assign(this, control);

        if(control.datafieldname && control.disabled != undefined) {
            xrmForm.getForm().setFieldDisabled(control.datafieldname, control.disabled);
        }
    }
}

export class Cell implements ICell {
    public form: IXrmForm;
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
    public labels?: FormXmlLabels | undefined;
    public control?: FormXmlControl;
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;
    public events: IEventEmitter<ICellEvents> = new EventEmitter<ICellEvents>();

    private _customLabel?: string;


    constructor(cell: FormXmlCell, form: IXrmForm) {
        Object.assign(this, cell);
        this.form = form;
        this.control = cell.control ? new Control(cell.control, form) : undefined;
    }

    public getLabel(): string | null {
        return this._customLabel ?? this.form.getLocalizedLabel(this.labels);
    }

    public setVisible(visible: boolean): void {
        if (this.getVisible() === visible) {
            return;
        }

        this.visible = visible;
        this.events.dispatchEvent("onSetVisible", visible);
    }

    public setLabel(label: string): void {
        if (this.getLabel() === label) {
            return;
        }

        this._customLabel = label;
        this.events.dispatchEvent("onLabelSet", label);
    }

    //MDA forms default
    public getVisible(): boolean {
        return this.visible ?? true;
    }
}

export class Section implements ISection {
    public id?: string | undefined;
    public form: IXrmForm;
    public name?: string | undefined;
    public group?: string | undefined;
    public showlabel?: boolean | undefined;
    public labelid?: string | undefined;
    public showbar?: boolean | undefined;
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
    public labels?: FormXmlLabels | undefined;
    public rows?: FormXmlSection["rows"];
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;
    public events: IEventEmitter<ISectionEvents> = new EventEmitter<ISectionEvents>();

    private _cells: ICell[] = [];
    private _customLabel?: string;

    constructor(section: FormXmlSection, form: IXrmForm) {
        Object.assign(this, section);
        this.form = form;
        this._cells = section.rows?.row?.flatMap(row => row.cell?.map(cell => new Cell(cell, form)) ?? []) ?? [];
        this._registerCellEvents(this._cells);
    }

    public getLabel(): string | null {
        return this._customLabel ?? this.form.getLocalizedLabel(this.labels);
    }

    public getCells(): ICell[] {
        return this._cells;
    }

    public getVisibleCells(): ICell[] {
        return this._cells.filter(cell => cell.getVisible());
    }

    public setVisible(visible: boolean): void {
        if (this.getVisible() === visible) {
            return;
        }

        this.visible = visible;
        this.events.dispatchEvent("onSetVisible", visible);
    }

    public setLabel(label: string): void {
        if (this.getLabel() === label) {
            return;
        }

        this._customLabel = label;
        this.events.dispatchEvent("onLabelSet", label);
    }

    //MDA forms default
    public getVisible(): boolean {
        return this.visible ?? true;
    }

    //MDA forms default
    public getCellLabelPosition(): "Top" | "Left" {
        return this.celllabelposition ?? "Left";
    }

    private _registerCellEvents(cells: ICell[]): void {
        for (const cell of cells) {
            cell.events.addEventListener("onSetVisible", (visible) => {
                this.events.dispatchEvent("onCellSetVisible", cell.id ?? "", visible);
            });
        }
    }
}

export class Column implements IColumn {
    public width: string = '100%';
    public sections?: FormXmlSections | undefined;

    private _sections: ISection[] = [];

    constructor(column: FormXmlColumn, form: IXrmForm) {
        Object.assign(this, column);
        this._sections = column.sections?.section?.map(section => new Section(section, form)) ?? [];
    }

    public getSections(): ISection[] {
        return this._sections;
    }

    public getVisibleSections(): ISection[] {
        return this._sections.filter(section => section.getVisible());
    }
}

export class Tab implements ITab {
    public form: IXrmForm;
    public events: IEventEmitter<ITabEvents> = new EventEmitter<ITabEvents>();
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
    public labels?: FormXmlLabels | undefined;
    public tabheader?: FormXmlHeaderFooter | undefined;
    public tabfooter?: FormXmlHeaderFooter | undefined;
    public columns: IColumn[];
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;

    private _customLabel?: string;


    constructor(tab: FormXmlTab, form: IXrmForm) {
        Object.assign(this, tab);
        this.form = form;
        this.id = tab.id ?? tab.name ?? window.crypto.randomUUID();
        this.columns = tab.columns?.column?.map(col => new Column(col, form)) ?? [];
        this._registerSectionEvents(this.getSections());
    }

    public getColumns(): IColumn[] {
        return this.columns
    }

    public getVisibleSections(): ISection[] {
        return this.getColumns().flatMap(column => column.getVisibleSections());
    }

    public getLabel(): string | null {
        return this._customLabel ?? this.form.getLocalizedLabel(this.labels);
    }

    public setVisible(visible: boolean): void {
        if (this.getVisible() === visible) {
            return;
        }

        this.visible = visible;
        this.events.dispatchEvent("onSetVisible", visible);
    }

    public getSections(): ISection[] {
        return this.getColumns().flatMap(column => column.getSections());
    }

    //MDA forms default
    public getVisible(): boolean {
        return this.visible ?? true;
    }

    public setLabel(label: string): void {
        if (this.getLabel() === label) {
            return;
        }

        this._customLabel = label;
        this.events.dispatchEvent("onLabelSet", label);
        this.form.requestRender();
    }

    private _registerSectionEvents(sections: ISection[]): void {
        for (const section of sections) {
            section.events.addEventListener("onSetVisible", (visible) => {
                this.events.dispatchEvent("onSectionSetVisible", section.id ?? "", visible);
            });
        }
    }
}

export class Tabs implements ITabs {
    public events: EventEmitter<ITabsEvents> = new EventEmitter<ITabsEvents>();
    public showlabels?: boolean | undefined;
    public addedby?: string | undefined;
    public filterby?: string | undefined;
    public dashboardCategory?: string | undefined;
    public timeframe?: string | undefined;
    public primaryentitylogicalname?: string | undefined;
    public entityview?: string | undefined;
    public tilespresent?: boolean | undefined;
    public tab: ITab[] = [];
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;

    constructor(tabs: FormXmlTabs, form: IXrmForm) {
        Object.assign(this, tabs);
        this.tab = tabs.tab.map(tab => new Tab(tab, form));
        this._registerTabEvents(this.tab);
    }

    public getExpandedTab(): ITab {
        const visibleTabs = this.getVisibleTabs();
        const expandedTab = visibleTabs.find(tab => tab.expanded) ?? visibleTabs[0];
        if (!expandedTab) {
            throw new Error("No visible tabs found in form XML");
        }
        return expandedTab;
    }

    public getVisibleTabs(): ITab[] {
        return this.tab.filter(tab => tab.getVisible());
    }

    public setExpandedTab(tabId: string): void {
        const newExpandedTab = this.getVisibleTabs().find(tab => tab.id === tabId);
        if (!newExpandedTab) {
            throw new Error(`Visible tab with id ${tabId} not found in form XML`);
        }
        const expandedTab = this.getExpandedTab();
        if (expandedTab.id === tabId) {
            return;
        }

        expandedTab.expanded = false;
        newExpandedTab.expanded = true;
        this.events.dispatchEvent("onTabChange", tabId);
    }

    private _registerTabEvents(tabs: ITab[]): void {
        tabs.map(tab => {
            tab.events.addEventListener("onSetVisible", (visible) => {
                this.events.dispatchEvent("onTabSetVisible", tab.id, visible);
            });
        });
    }
}

export interface IXrmFormEvents {
    onRenderRequested: () => void;
}

export interface IXrmForm extends Omit<FormXml, 'tabs' | 'events'> {
    tabs: ITabs;
    events: IEventEmitter<IXrmFormEvents>;
    getForm:() => IForm;
    getVisibleTabs: () => ITab[];
    getLocalizedLabel: (labels?: FormXmlLabels) => string | null;
    requestRender: () => void;
}



export class XrmForm implements IXrmForm {
    public ancestor?: FormXmlAncestor | undefined;
    public hiddencontrols?: FormXmlHiddenControls | undefined;
    public controlDescriptions?: FormXmlControlDescriptions | undefined;
    public tabs: ITabs;
    public header?: FormXmlHeaderFooter | undefined;
    public footer?: FormXmlHeaderFooter | undefined;
    public events: IEventEmitter<IXrmFormEvents>;
    public formLibraries?: FormXmlLibraryType | undefined;
    public externaldependencies?: FormXmlExternalDependencies | undefined;
    public formparameters?: FormXmlFormParameters | undefined;
    public clientresources?: FormXmlClientResources | undefined;
    public Navigation?: FormXmlNavigation | undefined;
    public DisplayConditions?: FormXmlDisplayConditions | undefined;
    public RibbonDiffXml?: FormXmlOpaqueElement | undefined;
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;
    public enablerelatedinformation?: boolean | undefined;
    public relatedInformationCollapsed?: boolean | undefined;
    public hasmargin?: boolean | undefined;
    public addedby?: string | undefined;
    public shownavigationbar?: boolean | undefined;
    public showImage?: boolean | undefined;
    public maxWidth?: number | undefined;

    private _lcid: number;
    private _form: IForm;

    constructor(params: IFormProps) {
        this._lcid = params.lcid;
        this._form = params.form;
        const formXml = parseFormXml(params.formXml);
        Object.assign(this, formXml);
        this.events = new EventEmitter<IXrmFormEvents>();
        this.tabs = new Tabs(formXml.tabs, this);
    }

    public getLocalizedLabel(labels?: FormXmlLabels): string | null {
        const localizedLabel = labels?.label?.find(label => label.languagecode === this._lcid);
        const fallbackLabel = labels?.label?.find(label => label.languagecode === LCID_ENGLISH_US) ?? labels?.label?.[0];
        return localizedLabel?.description ?? fallbackLabel?.description ?? null;
    }

    public getVisibleTabs(): ITab[] {
        return this.tabs.getVisibleTabs();
    }

    public getForm(): IForm {
        return this._form;
    }

    public requestRender(): void {
        this.events.dispatchEvent("onRenderRequested");
    }

}