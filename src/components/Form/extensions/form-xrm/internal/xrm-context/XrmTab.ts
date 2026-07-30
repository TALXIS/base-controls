import type { IFormXmlTab } from "../internal/FormXmlForm";
import { makeItemCollection } from "./collection";
import type { IXrmSectionContext, IXrmTabContext } from "./interfaces";
import type { IXrmFormContextInternal } from "./XrmFormContext";
import { XrmSection } from "./XrmSection";

export class XrmTab implements IXrmTabContext {
    public readonly sections: Xrm.Collection.ItemCollection<IXrmSectionContext>;
    private _tab: IFormXmlTab;
    private _formContext: IXrmFormContextInternal;
    private _tabStateChangeHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(tab: IFormXmlTab, formContext: IXrmFormContextInternal) {
        this._formContext = formContext;
        this._tab = tab;
        this.sections = this._createSectionsCollection();
        this._registerEventListeners();
    }

    public getName(): string {
        return this._tab.name ?? '';
    }

    public getLabel(): string {
        return this._tab.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._tab.setLabel(label);
    }

    public getVisible(): boolean {
        return this._tab.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._tab.setVisible(visible);
    }

    public getDisplayState(): Xrm.DisplayState {
        return this._tab.getExpanded() ? "expanded" : "collapsed";
    }

    public setDisplayState(state: Xrm.DisplayState): void {
        throw new Error("XrmTab.setDisplayState is not supported. Use setFocus() instead.");
    }

    public setFocus(): void {
        this._tab.setExpanded();
    }

    public addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._tabStateChangeHandlerSet.add(handler);
    }

    public removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._tabStateChangeHandlerSet.delete(handler);
    }

    private _createSectionsCollection(): Xrm.Collection.ItemCollection<IXrmSectionContext> {
        const sections = this._tab.getSections();
        return makeItemCollection(sections.map((s) => new XrmSection(s, this._formContext)), (s) => s.getName()) as any;
    }

    private _registerEventListeners() {
        this._formContext.getFormXmlModel().tabs.events.addEventListener('onTabFocusChanged', this._tabFocusChangedHandler);
        this._formContext.getFormXmlModel().getForm().events.addEventListener('onDestroy', this._formDestroyedHandler);
    }

    private _fireOnTabStateChange() {
        this._tabStateChangeHandlerSet.forEach((handler) => {
            try {
                handler({} as any);
            } catch (err) {
                console.error(`[Form] XrmTab.onTabStateChange handler failed for tab "${this._tab.name}":`, err);
            }
        });
    }

    private _tabFocusChangedHandler = (tabId: string): void => {
        if (tabId !== this._tab.id) return;
        this._fireOnTabStateChange();
    };

    private _formDestroyedHandler = (): void => {
        this._formContext.getFormXmlModel().tabs.events.removeEventListener('onTabFocusChanged', this._tabFocusChangedHandler);
        this._tabStateChangeHandlerSet.clear();
    };
}
