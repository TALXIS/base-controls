import { EventEmitter } from "@talxis/client-libraries";
import { IEventSubscriber, ServiceRegistry } from "@core";
import type { IFormTab } from "../tab/FormTab";

/** What the form's tabs raise. */
export interface IFormTabsEvents {
    /** Fires when another tab is opened. */
    onActiveTabChanged: (tab: IFormTab) => void;
    /** Fires when a tab is drawn. */
    onTabAdded: (tab: IFormTab) => void;
    /** Fires when a tab is no longer drawn. */
    onTabRemoved: (tab: IFormTab) => void;
}

/** The form's tabs: finding them, and which one is open. */
export interface IFormTabs {
    readonly events: IEventSubscriber<IFormTabsEvents>;
    /** The tabs drawn, by name. */
    readonly parts: ServiceRegistry<{ [name: string]: IFormTab }>;
    /** @throws While no tab of that name is drawn. */
    get(name: string): IFormTab;
    find(name: string): IFormTab | undefined;
    /** In the order they are drawn. */
    getAll(): IFormTab[];
    /** The tab opened, or the first visible one until one is. */
    getActive(): IFormTab | undefined;
    /** Opens the tab, keeping the one it leaves drawn. */
    setActive(name: string): void;
    /** Raises `onTabAdded` now and `onTabRemoved` when the returned detach is called. */
    attach(tab: IFormTab): () => void;
}

export class FormTabs implements IFormTabs {
    public readonly events = new EventEmitter<IFormTabsEvents>();
    public readonly parts = new ServiceRegistry<{ [name: string]: IFormTab }>();
    private _activeName?: string;

    public get(name: string): IFormTab {
        return this.parts.get(name);
    }

    public find(name: string): IFormTab | undefined {
        return this.parts.find(name);
    }

    public getAll(): IFormTab[] {
        return this.parts.getAll();
    }

    public getActive(): IFormTab | undefined {
        const active = this._activeName === undefined ? undefined : this.parts.find(this._activeName);
        return active ?? this.getAll().find(tab => tab.isVisible());
    }

    public setActive(name: string): void {
        const previous = this.getActive();
        this._activeName = name;
        const active = this.parts.find(name);
        if (!active || active === previous) {
            return;
        }
        previous?.load();
        active.load();
        this.events.dispatchEvent('onActiveTabChanged', active);
    }

    public attach(tab: IFormTab): () => void {
        this.events.dispatchEvent('onTabAdded', tab);
        return () => this.events.dispatchEvent('onTabRemoved', tab);
    }

    public destroy(): void {
        this.parts.destroy();
        this.events.clearEventListeners();
    }
}
