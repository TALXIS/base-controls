import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { parseFormXml, FormXml, FormXmlTabs, FormXmlTab, FormXmlOpaqueNode, FormXmlPrimitiveValue, FormXmlColumns, FormXmlEvents, FormXmlHeaderFooter, FormXmlLabels, FormXmlAncestor, FormXmlClientResources, FormXmlControlDescriptions, FormXmlDisplayConditions, FormXmlExternalDependencies, FormXmlFormParameters, FormXmlHiddenControls, FormXmlLibraryType, FormXmlNavigation, FormXmlOpaqueElement, FormXmlColumn, FormXmlSections, FormXmlSection, FormXmlCell } from "@talxis/client-metadata";

const LCID_ENGLISH_US = 1033;

export interface IFormProps {
    formXml: string;
    lcid: number;
}


export interface ITabsEvents {
    onTabChange: (tabId: string) => void;
}

export interface ITabs extends FormXmlTabs {
    getExpandedTab: () => ITab;
    setExpandedTab: (tabId: string) => void;
    tab: ITab[];
    events: IEventEmitter<ITabsEvents>;
}

export interface ITab extends FormXmlTab {
    id: string;
    form: IXrmForm;
    getLocalizedLabel: () => string | null;
    getColumns: () => IColumn[];

}

export interface ISection extends FormXmlSection {
    getLocalizedLabel: () => string | null;
    getCells: () => ICell[];
}

export interface IColumn extends FormXmlColumn {
    getSections: () => ISection[];
}

export interface ICell extends FormXmlCell {
    getLocalizedLabel: () => string | null;
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
    public control?: FormXmlCell["control"];
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;

    constructor(cell: FormXmlCell, form: IXrmForm) {
        Object.assign(this, cell);
        this.form = form;
    }

    public getLocalizedLabel(): string | null {
        return this.form.getLocalizedLabel(this.labels);
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

    private _cells: ICell[] = [];

    constructor(section: FormXmlSection, form: IXrmForm) {
        Object.assign(this, section);
        this.form = form;
        this._cells = section.rows?.row?.flatMap(row => row.cell?.map(cell => new Cell(cell, form)) ?? []) ?? [];
    }

    public getLocalizedLabel(): string | null {
        return this.form.getLocalizedLabel(this.labels);
    }

    public getCells(): ICell[] {
        return this._cells;
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
}

export class Tab implements ITab {
    public form: IXrmForm;
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
    //@ts-ignore - typings
    public columns: FormXmlColumns;
    public events?: FormXmlEvents | undefined;
    public additionalAttributes?: Record<string, FormXmlPrimitiveValue> | undefined;
    public additionalElements?: FormXmlOpaqueNode[] | undefined;

    private _columns: IColumn[] = [];

    constructor(tab: FormXmlTab, form: IXrmForm) {
        Object.assign(this, tab);
        this.form = form;
        this.id = tab.id ?? tab.name ?? window.crypto.randomUUID();
        this._columns = tab.columns?.column?.map(col => new Column(col, form)) ?? [];
    }

    public getColumns(): IColumn[] {
        return this._columns;
    }

    public getLocalizedLabel(): string | null {
        return this.form.getLocalizedLabel(this.labels);
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
    }

    public getExpandedTab(): ITab {
        const expandedTab = this.tab.find(t => t.expanded) ?? this.tab[0];
        if (!expandedTab) {
            throw new Error("No tabs found in form XML");
        }
        return expandedTab;
    }
    public setExpandedTab(tabId: string): void {
        const newExpandedTab = this.tab.find(t => t.id === tabId);
        if (!newExpandedTab) {
            throw new Error(`Tab with id ${tabId} not found in form XML`);
        }
        this.getExpandedTab().expanded = false;
        newExpandedTab.expanded = true;
        this.events.dispatchEvent("onTabChange", tabId);
    }
}

export interface IXrmForm extends FormXml {
    getLocalizedLabel: (labels?: FormXmlLabels) => string | null;
}



export class XrmForm implements IXrmForm {
    public ancestor?: FormXmlAncestor | undefined;
    public hiddencontrols?: FormXmlHiddenControls | undefined;
    public controlDescriptions?: FormXmlControlDescriptions | undefined;
    public tabs: ITabs;
    public header?: FormXmlHeaderFooter | undefined;
    public footer?: FormXmlHeaderFooter | undefined;
    public events?: FormXmlEvents | undefined;
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

    constructor(params: IFormProps) {
        this._lcid = params.lcid;
        const formXml = parseFormXml(params.formXml);
        Object.assign(this, formXml);
        this.tabs = new Tabs(formXml.tabs, this);
    }

    public getLocalizedLabel(labels?: FormXmlLabels): string | null {
        const localizedLabel = labels?.label?.find(label => label.languagecode === this._lcid);
        const fallbackLabel = labels?.label?.find(label => label.languagecode === LCID_ENGLISH_US) ?? labels?.label?.[0];

        return localizedLabel?.description ?? fallbackLabel?.description ?? null;
    }

}