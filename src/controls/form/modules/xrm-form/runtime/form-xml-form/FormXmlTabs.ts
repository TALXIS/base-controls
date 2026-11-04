import { EventEmitter } from "@talxis/client-libraries";
import type { IFormXmlModel, IFormXmlTab, IFormXmlTabs, IFormXmlTabsEvents, MetadataFormXmlOpaqueNode, MetadataFormXmlPrimitiveValue, MetadataFormXmlTabs } from "./interfaces";
import { FormXmlTab } from "./FormXmlTab";

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

        const allExpandedTabs = this.tab.filter(tab => tab.getExpanded());
        allExpandedTabs.map(tab => tab.expanded = false);
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
