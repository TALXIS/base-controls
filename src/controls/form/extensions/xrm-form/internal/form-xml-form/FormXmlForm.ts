import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { parseFormXml, FormXml as MetadataFormXml } from "@talxis/client-metadata";
import { XrmFactory } from "@utils/adapters/xrm";
import type {
    IFormXmlAttribute,
    IFormXmlCell,
    IFormXmlControl,
    IFormXmlFormEvents,
    IFormXmlFormProps,
    IFormXmlModel,
    IFormXmlSection,
    IFormXmlTab,
    IFormXmlTabs,
    INotification,
    MetadataFormXmlAncestor,
    MetadataFormXmlClientResources,
    MetadataFormXmlControlDescriptions,
    MetadataFormXmlDisplayConditions,
    MetadataFormXmlExternalDependencies,
    MetadataFormXmlFormParameters,
    MetadataFormXmlHeaderFooter,
    MetadataFormXmlHiddenControls,
    MetadataFormXmlLabels,
    MetadataFormXmlLibraryType,
    MetadataFormXmlNavigation,
    MetadataFormXmlOpaqueElement,
    MetadataFormXmlOpaqueNode,
    MetadataFormXmlPrimitiveValue,
} from "./interfaces";
import { FormXmlAttribute } from "./FormXmlAttribute";
import { FormXmlTabs } from "./FormXmlTabs";

const LCID_ENGLISH_US = 1033;

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
    private _form: IFormXmlFormProps["form"];
    private _notifications: INotification[] = [];
    private _attributes: Map<string, IFormXmlAttribute> = new Map();

    constructor(params: IFormXmlFormProps) {
        this._lcid = params.lcid;
        this._form = params.form;
        const formXml = parseFormXml(params.formXml) as MetadataFormXml;
        Object.assign(this, formXml);
        this.events = new EventEmitter<IFormXmlFormEvents>();
        this.tabs = new FormXmlTabs(formXml.tabs, this);
        this._createAttributes();
    }

    public getLocalizedLabel(labels?: MetadataFormXmlLabels): string | null {
        const localizedLabel = labels?.label?.find(label => label.languagecode === this._lcid);
        const fallbackLabel = labels?.label?.find(label => label.languagecode === LCID_ENGLISH_US) ?? labels?.label?.[0];
        return localizedLabel?.description ?? fallbackLabel?.description ?? null;
    }

    public getVisibleTabs(): IFormXmlTab[] {
        return this.tabs.getVisibleTabs();
    }

    public getForm() {
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

    public getAttributes(): IFormXmlAttribute[] {
        return Array.from(this._attributes.values());
    }

    public getAttribute(name: string): IFormXmlAttribute | null {
        return this._attributes.get(name) ?? null;
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

    private _createAttributes(): void {
        this.getForm().getFields().map(field => {
            this._attributes.set(field.getColumn().name, new FormXmlAttribute(field, this));
        });
    }
}
