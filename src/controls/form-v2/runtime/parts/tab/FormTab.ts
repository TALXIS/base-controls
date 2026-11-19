import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IForm } from "../../interfaces";
import type { IFormSection } from "../section/FormSection";

/** What a tab raises. */
export interface IFormTabEvents {
    /** Fires when the tab is shown or hidden. */
    onVisibleChanged: (visible: boolean) => void;
    /** Fires when the tab's label changes. */
    onLabelChanged: (label: string) => void;
    /** Fires when the tab is first opened, so its controls are drawn. */
    onLoaded: () => void;
}

/** One tab of the form. */
export interface IFormTab {
    readonly events: IEventSubscriber<IFormTabEvents>;
    getName(): string;
    getLabel(): string;
    setLabel(label: string): void;
    isVisible(): boolean;
    /** Hides the tab with CSS; what is inside stays loaded. */
    setVisible(visible: boolean): void;
    /** Whether the tab has been opened, so its controls are drawn. */
    isLoaded(): boolean;
    /** Opens the tab. */
    setActive(): void;
    getSections(): IFormSection[];
    /** Draws the tab's controls from now on. */
    load(): void;
}

export interface IFormTabParameters {
    name: string;
    form: IForm;
    label?: string;
    visible?: boolean;
}

export class FormTab implements IFormTab {
    public readonly events = new EventEmitter<IFormTabEvents>();
    private _name: string;
    private _form: IForm;
    private _label: string;
    private _visible: boolean;
    private _isLoaded = false;

    constructor(parameters: IFormTabParameters) {
        this._name = parameters.name;
        this._form = parameters.form;
        this._label = parameters.label ?? parameters.name;
        this._visible = parameters.visible ?? true;
    }

    public getName(): string {
        return this._name;
    }

    public getLabel(): string {
        return this._label;
    }

    public setLabel(label: string): void {
        this._label = label;
        this.events.dispatchEvent('onLabelChanged', label);
    }

    public isVisible(): boolean {
        return this._visible;
    }

    public setVisible(visible: boolean): void {
        if (this._visible === visible) {
            return;
        }
        this._visible = visible;
        this.events.dispatchEvent('onVisibleChanged', visible);
    }

    //the tab shown before any was opened has not been through load()
    public isLoaded(): boolean {
        return this._isLoaded || this._form.tabs.getActive() === this;
    }

    public load(): void {
        if (this._isLoaded) {
            return;
        }
        this._isLoaded = true;
        this.events.dispatchEvent('onLoaded');
    }

    public setActive(): void {
        this._form.tabs.setActive(this._name);
    }

    public getSections(): IFormSection[] {
        return this._form.sections.getAll().filter(section => section.getTab() === this);
    }
}
