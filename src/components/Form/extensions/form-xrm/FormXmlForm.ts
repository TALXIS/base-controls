import { EventEmitter, IEventEmitter, IFieldValidationResult } from "@talxis/client-libraries";
import {
    parseFormXml,
    FormXml as MetadataFormXml,
    FormXmlTabs as MetadataFormXmlTabs,
    FormXmlTab as MetadataFormXmlTab,
    FormXmlOpaqueNode as MetadataFormXmlOpaqueNode,
    FormXmlPrimitiveValue as MetadataFormXmlPrimitiveValue,
    FormXmlHeaderFooter as MetadataFormXmlHeaderFooter,
    FormXmlLabels as MetadataFormXmlLabels,
    FormXmlAncestor as MetadataFormXmlAncestor,
    FormXmlClientResources as MetadataFormXmlClientResources,
    FormXmlControlDescriptions as MetadataFormXmlControlDescriptions,
    FormXmlDisplayConditions as MetadataFormXmlDisplayConditions,
    FormXmlExternalDependencies as MetadataFormXmlExternalDependencies,
    FormXmlFormParameters as MetadataFormXmlFormParameters,
    FormXmlHiddenControls as MetadataFormXmlHiddenControls,
    FormXmlLibraryType as MetadataFormXmlLibraryType,
    FormXmlNavigation as MetadataFormXmlNavigation,
    FormXmlOpaqueElement as MetadataFormXmlOpaqueElement,
    FormXmlColumn as MetadataFormXmlColumn,
    FormXmlSections as MetadataFormXmlSections,
    FormXmlSection as MetadataFormXmlSection,
    FormXmlCell as MetadataFormXmlCell,
    FormXmlControl as MetadataFormXmlControl,
} from "@talxis/client-metadata";
import { IForm } from "../../Form";

const LCID_ENGLISH_US = 1033;

export interface IFormXmlFormProps {
    formXml: string;
    form: IForm;
    lcid: number;
}


export interface IFormXmlTabsEvents {
    onExpandedTabChanged: (tabId: string) => void;
    onTabFocusChanged: (tabId: string, focused: boolean) => void;
    onTabVisibilityChanged: (tabId: string, visible: boolean) => void;
}

export interface IFormXmlTabs extends Omit<MetadataFormXmlTabs, 'tab'> {
    tab: IFormXmlTab[];
    events: IEventEmitter<IFormXmlTabsEvents>;
    getExpandedTab: () => IFormXmlTab;
    getVisibleTabs: () => IFormXmlTab[];
    setExpandedTab: (tabId: string) => void;
}

export interface IFormXmlTabEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onExpandedChanged: (expanded: boolean) => void;
    onSectionVisibilityChanged: (sectionId: string, visible: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlTab extends Omit<MetadataFormXmlTab, 'events' | 'columns'> {
    id: string;
    formXmlModel: IFormXmlModel;
    events: IEventEmitter<IFormXmlTabEvents>;
    getLabel: () => string | null;
    setExpanded: () => void;
    getExpanded: () => boolean;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getColumns: () => IFormXmlColumn[];
    getVisibleSections: () => IFormXmlSection[];
    getSections: () => IFormXmlSection[];

}

export interface IFormXmlSectionEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onCellVisibilityChanged: (cellId: string, visible: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlSection extends Omit<MetadataFormXmlSection, 'events'> {
    events: IEventEmitter<IFormXmlSectionEvents>;
    getLabel: () => string | null;
    getCells: () => IFormXmlCell[];
    getControls: () => IFormXmlControl[];
    getVisibleCells: () => IFormXmlCell[];
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
    getCellLabelPosition: () => "Top" | "Left";
}

export interface IFormXmlColumn extends MetadataFormXmlColumn {
    getSections: () => IFormXmlSection[];
    getVisibleSections: () => IFormXmlSection[];
}

export interface IFormXmlCellEvents {
    onVisibilityChanged: (visible: boolean) => void;
    onDisabledChanged: (disabled: boolean) => void;
    onLabelChanged: (label: string) => void;
}

export interface IFormXmlCell extends Omit<MetadataFormXmlCell, 'events' | 'control'> {
    control?: IFormXmlControl;
    events: IEventEmitter<IFormXmlCellEvents>;
    getLabel: () => string | null;
    getDisabled: () => boolean;
    setDisabled: (disabled: boolean) => void;
    getVisible: () => boolean;
    setVisible: (visible: boolean) => void;
    setLabel: (label: string) => void;
}

export interface IFormXmlControl extends MetadataFormXmlControl {
    getCell: () => IFormXmlCell;
    setValidation: (validation: IFieldValidationResult) => void;
    getValidation: () => IFieldValidationResult | null;
}

export class FormXmlControl implements IFormXmlControl {
    private _cell: IFormXmlCell;
    private _validation?: IFieldValidationResult;

    constructor(control: MetadataFormXmlControl, cell: IFormXmlCell) {
        Object.assign(this, control);
        this._cell = cell;
    }

    public getCell(): IFormXmlCell {
        return this._cell;
    }

    public setValidation(validation: IFieldValidationResult): void {
        this._validation = validation;
    }

    public getValidation(): IFieldValidationResult | null {
        return this._validation ?? null;
    }
}

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

    public getDisabled(): boolean {
        return this.control?.disabled ?? false;
    }

    public setDisabled(disabled: boolean): void {
        if (this.getDisabled() === disabled) {
            return;
        }
        if (this.control) {
            this.control.disabled = disabled;
            this.events.dispatchEvent("onDisabledChanged", disabled);
        }
    }

    //MDA forms default
    public getVisible(): boolean {
        return this.visible ?? true;
    }
}

export class FormXmlSection implements IFormXmlSection {
    public id?: string | undefined;
    public formXmlModel: IFormXmlModel;
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
    public labels?: MetadataFormXmlLabels | undefined;
    public rows?: MetadataFormXmlSection["rows"];
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;
    public events: IEventEmitter<IFormXmlSectionEvents> = new EventEmitter<IFormXmlSectionEvents>();

    private _cells: IFormXmlCell[] = [];
    private _customLabel?: string;

    constructor(section: MetadataFormXmlSection, formXmlModel: IFormXmlModel) {
        Object.assign(this, section);
        this.formXmlModel = formXmlModel;
        this._cells = section.rows?.row?.flatMap(row => row.cell?.map(cell => new FormXmlCell(cell, formXmlModel)) ?? []) ?? [];
        this._registerCellEvents(this._cells);
    }

    public getLabel(): string | null {
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

    //MDA forms default
    public getVisible(): boolean {
        return this.visible ?? true;
    }

    //MDA forms default
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

export class FormXmlColumn implements IFormXmlColumn {
    public width: string = '100%';
    public sections?: MetadataFormXmlSections | undefined;

    private _sections: IFormXmlSection[] = [];

    constructor(column: MetadataFormXmlColumn, formXmlModel: IFormXmlModel) {
        Object.assign(this, column);
        this._sections = column.sections?.section?.map(section => new FormXmlSection(section, formXmlModel)) ?? [];
    }

    public getSections(): IFormXmlSection[] {
        return this._sections;
    }

    public getVisibleSections(): IFormXmlSection[] {
        return this._sections.filter(section => section.getVisible());
    }
}

export class FormXmlTab implements IFormXmlTab {
    public formXmlModel: IFormXmlModel;
    public events: IEventEmitter<IFormXmlTabEvents> = new EventEmitter<IFormXmlTabEvents>();
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
        this.id = tab.id ?? tab.name ?? window.crypto.randomUUID();
        this.columns = tab.columns?.column?.map(col => new FormXmlColumn(col, formXmlModel)) ?? [];
        this._registerSectionEvents(this.getSections());
    }

    public getColumns(): IFormXmlColumn[] {
        return this.columns
    }

    public getVisibleSections(): IFormXmlSection[] {
        return this.getColumns().flatMap(column => column.getVisibleSections());
    }

    public getLabel(): string | null {
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

    //MDA forms default
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
        })
    }
}

export class FormXmlTabs implements IFormXmlTabs {
    public events: EventEmitter<IFormXmlTabsEvents> = new EventEmitter<IFormXmlTabsEvents>();
    public showlabels?: boolean | undefined;
    public addedby?: string | undefined;
    public filterby?: string | undefined;
    public dashboardCategory?: string | undefined;
    public timeframe?: string | undefined;
    public primaryentitylogicalname?: string | undefined;
    public entityview?: string | undefined;
    public tilespresent?: boolean | undefined;
    public tab: IFormXmlTab[] = [];
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;

    constructor(tabs: MetadataFormXmlTabs, formXmlModel: IFormXmlModel) {
        Object.assign(this, tabs);
        this.tab = tabs.tab.map(tab => new FormXmlTab(tab, formXmlModel));
        this._registerTabEvents(this.tab);
    }

    public getExpandedTab(): IFormXmlTab {
        const visibleTabs = this.getVisibleTabs();
        const expandedTab = visibleTabs.find(tab => tab.getExpanded()) ?? visibleTabs[0];
        if (!expandedTab) {
            throw new Error("No visible tabs found in form XML");
        }
        return expandedTab;
    }

    public getVisibleTabs(): IFormXmlTab[] {
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
        this.events.dispatchEvent("onTabFocusChanged", expandedTab.id, false);
        this.events.dispatchEvent("onTabFocusChanged", newExpandedTab.id, true);
        this.events.dispatchEvent("onExpandedTabChanged", newExpandedTab.id);
    }

    private _registerTabEvents(tabs: IFormXmlTab[]): void {
        tabs.map(tab => {
            tab.events.addEventListener("onVisibilityChanged", (visible) => {
                this.events.dispatchEvent("onTabVisibilityChanged", tab.id, visible);
            });
        });
    }
}

export interface IFormXmlFormEvents {
    onRenderRequested: () => void;
    onNotificationsChanged: (notifications: INotification[]) => void;
}

export interface IFormXmlModel extends Omit<MetadataFormXml, 'tabs' | 'events'> {
    tabs: IFormXmlTabs;
    events: IEventEmitter<IFormXmlFormEvents>;
    getForm: () => IForm;
    getVisibleTabs: () => IFormXmlTab[];
    getSections: () => IFormXmlSection[];
    getCells: () => IFormXmlCell[];
    getControls: () => IFormXmlControl[];
    getTabs: () => IFormXmlTab[];
    getNotifications: () => INotification[];
    setNotifications: (notifications: INotification[]) => void;
    getLocalizedLabel: (labels?: MetadataFormXmlLabels) => string | null;
    requestRender: () => void;
}

export interface INotification {
    message: string;
    level: 'ERROR' | 'WARNING' | 'INFO';
}



export class FormXmlForm implements IFormXmlModel {
    public ancestor?: MetadataFormXmlAncestor | undefined;
    public hiddencontrols?: MetadataFormXmlHiddenControls | undefined;
    public controlDescriptions?: MetadataFormXmlControlDescriptions | undefined;
    public tabs: IFormXmlTabs;
    public header?: MetadataFormXmlHeaderFooter | undefined;
    public footer?: MetadataFormXmlHeaderFooter | undefined;
    public events: IEventEmitter<IFormXmlFormEvents>;
    public formLibraries?: MetadataFormXmlLibraryType | undefined;
    public externaldependencies?: MetadataFormXmlExternalDependencies | undefined;
    public formparameters?: MetadataFormXmlFormParameters | undefined;
    public clientresources?: MetadataFormXmlClientResources | undefined;
    public Navigation?: MetadataFormXmlNavigation | undefined;
    public DisplayConditions?: MetadataFormXmlDisplayConditions | undefined;
    public RibbonDiffXml?: MetadataFormXmlOpaqueElement | undefined;
    public additionalAttributes?: Record<string, MetadataFormXmlPrimitiveValue> | undefined;
    public additionalElements?: MetadataFormXmlOpaqueNode[] | undefined;
    public enablerelatedinformation?: boolean | undefined;
    public relatedInformationCollapsed?: boolean | undefined;
    public hasmargin?: boolean | undefined;
    public addedby?: string | undefined;
    public shownavigationbar?: boolean | undefined;
    public showImage?: boolean | undefined;
    public maxWidth?: number | undefined;

    private _lcid: number;
    private _form: IForm;
    private _notifications: INotification[] = [];

    constructor(params: IFormXmlFormProps) {
        this._lcid = params.lcid;
        this._form = params.form;
        const formXml = parseFormXml(params.formXml);
        Object.assign(this, formXml);
        this.events = new EventEmitter<IFormXmlFormEvents>();
        this.tabs = new FormXmlTabs(formXml.tabs, this);
    }

    public getLocalizedLabel(labels?: MetadataFormXmlLabels): string | null {
        const localizedLabel = labels?.label?.find(label => label.languagecode === this._lcid);
        const fallbackLabel = labels?.label?.find(label => label.languagecode === LCID_ENGLISH_US) ?? labels?.label?.[0];
        return localizedLabel?.description ?? fallbackLabel?.description ?? null;
    }

    public getVisibleTabs(): IFormXmlTab[] {
        return this.tabs.getVisibleTabs();
    }

    public getForm(): IForm {
        return this._form;
    }

    public getNotifications(): INotification[] {
        return this._notifications;
    }

    public setNotifications(notifications: INotification[]): void {
        this._notifications = notifications;
        this.events.dispatchEvent("onNotificationsChanged", notifications);
    }

    public getCells(): IFormXmlCell[] {
        return this.tabs.tab.flatMap(tab => tab.getSections().flatMap(section => section.getCells()));
    }

    public getControls(): IFormXmlControl[] {
        return this.getCells().filter(cell => cell.control).map(cell => cell.control!);
    }

    public getTabs(): IFormXmlTab[] {
        return this.tabs.tab;
    }

    public getSections(): IFormXmlSection[] {
        return this.tabs.tab.flatMap(tab => tab.getSections());
    }

    public requestRender(): void {
        this.events.dispatchEvent("onRenderRequested");
    }

}