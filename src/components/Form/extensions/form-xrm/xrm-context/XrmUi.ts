import type { INotification } from "../FormXmlForm";
import { makeItemCollection } from "./collection";
import { XrmControl } from "./XrmControl";
import type { XrmFormContext } from "./XrmFormContext";
import { XrmTab } from "./XrmTab";
import { notImplemented } from "./utils";

export class XrmUi {
    readonly tabs: Xrm.Collection.ItemCollection<XrmTab>;
    readonly controls: Xrm.Collection.ItemCollection<XrmControl>;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;

    private _formContext: XrmFormContext;
    private _notificationMap: Map<string, INotification> = new Map();
    private _onLoadHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
        this.tabs = this._createTabsCollection();
        this.controls = this._createControlsCollection();
    }

    public getFormType(): XrmEnum.FormType {
        return 2;
    }

    public getViewPortHeight(): number {
        return 0;
    }

    public getViewPortWidth(): number {
        return 0;
    }

    public refreshRibbon(refreshAll?: boolean): void {
        void refreshAll;
        notImplemented("ui.refreshRibbon");
    }

    public setFormEntityName(name: string): void {
        void name;
        notImplemented("ui.setFormEntityName");
    }

    public addOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onLoadHandlerSet.add(handler);
    }

    public removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onLoadHandlerSet.delete(handler);
    }

    public setFormNotification(message: string, level: INotification['level'], uniqueId: string): boolean {
        this._notificationMap.set(uniqueId ?? crypto.randomUUID(), { message, level });
        this._formContext.getFormXmlModel().setNotifications(Array.from(this._notificationMap.values()));
        return true;
    }

    public clearFormNotification(uniqueId: string): boolean {
        const result = this._notificationMap.delete(uniqueId);
        if (result) {
            this._formContext.getFormXmlModel().setNotifications(Array.from(this._notificationMap.values()));
        }
        return result;
    }

    public close(): void {
        notImplemented("ui.close");
    }

    private _createControlsCollection(): Xrm.Collection.ItemCollection<XrmControl> {
        const controls = this._formContext.getFormXmlModel().getControls();
        return makeItemCollection(controls.map((c) => new XrmControl(c, this._formContext)), (c) => c.getName()) as any;
    }

    private _createTabsCollection(): Xrm.Collection.ItemCollection<XrmTab> {
        const tabs = this._formContext.getFormXmlModel().getTabs();
        return makeItemCollection(tabs.map((t) => new XrmTab(t, this._formContext)), (t) => t.getName()) as any;
    }
}
