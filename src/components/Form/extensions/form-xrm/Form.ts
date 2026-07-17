import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { parseFormXml, FormXml, FormXmlTabs, FormXmlTab, FormXmlOpaqueNode, FormXmlPrimitiveValue, FormXmlColumns, FormXmlEvents, FormXmlHeaderFooter, FormXmlLabels, FormXmlAncestor, FormXmlClientResources, FormXmlControlDescriptions, FormXmlDisplayConditions, FormXmlExternalDependencies, FormXmlFormParameters, FormXmlHiddenControls, FormXmlLibraryType, FormXmlNavigation, FormXmlOpaqueElement } from "@talxis/client-metadata";

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

}

export class Tab implements ITab {
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

    constructor(tab: FormXmlTab) {
        Object.assign(this, tab);
        this.id = tab.id ?? tab.name ?? window.crypto.randomUUID();
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

    constructor(tabs: FormXmlTabs) {
        Object.assign(this, tabs);
        this.tab = tabs.tab.map(t => new Tab(t));
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
    getLocalizedLabel: (labels: FormXmlLabels) => string | null;
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
        this.tabs = new Tabs(formXml.tabs);
    }

    public getLocalizedLabel(labels: FormXmlLabels): string | null {
        const localizedLabel = labels.label?.find(label => label.languagecode === this._lcid);
        const fallbackLabel = labels.label?.find(label => label.languagecode === LCID_ENGLISH_US) ?? labels.label?.[0];

        return localizedLabel?.description ?? fallbackLabel?.description ?? null;
    }

}