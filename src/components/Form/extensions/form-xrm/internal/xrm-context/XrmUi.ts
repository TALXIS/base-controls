import type { INotification } from "../internal/FormXmlForm";
import { makeItemCollection } from "./collection";
import { XrmControl } from "./XrmControl";
import type { IXrmControlContext, IXrmTabContext } from "./interfaces";
import type { IXrmFormContextInternal, IXrmUiContextInternal } from "./XrmFormContext";
import { XrmTab } from "./XrmTab";
import { notImplemented } from "./utils";

export class XrmUi implements IXrmUiContextInternal {
    readonly tabs: Xrm.Collection.ItemCollection<IXrmTabContext>;
    readonly controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;

    private _formContext: IXrmFormContextInternal;
    private _notificationMap: Map<string, INotification> = new Map();
    private _onLoadHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formContext: IXrmFormContextInternal) {
        this._formContext = formContext;
        this.tabs = this._createTabsCollection();
        this.controls = this._createControlsCollection();
        this._registerEventListeners();
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

    public fireOnLoad(): void {
        this._onLoadHandlerSet.forEach((handler) => {
            try {
                handler({} as any);
            } catch (error) {
                console.error("[Form] XrmUi.onLoad handler failed:", error);
            }
        });
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

    private _createControlsCollection(): Xrm.Collection.ItemCollection<IXrmControlContext> {
        const controls = this._formContext.getFormXmlModel().getControls();
        return makeItemCollection(controls.map((c) => new XrmControl(c, this._formContext)), (c) => c.getName()) as any;
    }

    private _createTabsCollection(): Xrm.Collection.ItemCollection<IXrmTabContext> {
        const tabs = this._formContext.getFormXmlModel().getTabs();
        return makeItemCollection(tabs.map((tab) => new XrmTab(tab, this._formContext)), (tab) => tab.getName()) as any;
    }

    private _registerEventListeners(): void {
        this._formContext.getFormXmlModel().getForm().events.addEventListener('onDestroy', () => {
            this._onLoadHandlerSet.clear();
            this._notificationMap.clear();
        });
    }
}
