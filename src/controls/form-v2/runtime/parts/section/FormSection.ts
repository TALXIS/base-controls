import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IForm } from "../../interfaces";
import type { IFormTab } from "../tab/FormTab";
import type { IFormControl } from "../control/FormControl";

/** What a section raises. */
export interface IFormSectionEvents {
    /** Fires when the section is shown or hidden. */
    onVisibleChanged: (visible: boolean) => void;
    /** Fires when the section's label changes. */
    onLabelChanged: (label: string) => void;
}

/** A titled group of controls. */
export interface IFormSection {
    readonly events: IEventSubscriber<IFormSectionEvents>;
    getName(): string;
    /** The tab the section is drawn in, if any. */
    getTab(): IFormTab | undefined;
    getLabel(): string | undefined;
    setLabel(label: string): void;
    isVisible(): boolean;
    /** Hides the section with CSS; its controls stay loaded. */
    setVisible(visible: boolean): void;
    getControls(): IFormControl[];
}

export interface IFormSectionParameters {
    name: string;
    form: IForm;
    tab?: IFormTab;
    label?: string;
    visible?: boolean;
}

export class FormSection implements IFormSection {
    public readonly events = new EventEmitter<IFormSectionEvents>();
    private _name: string;
    private _form: IForm;
    private _tab?: IFormTab;
    private _label?: string;
    private _visible: boolean;

    constructor(parameters: IFormSectionParameters) {
        this._name = parameters.name;
        this._form = parameters.form;
        this._tab = parameters.tab;
        this._label = parameters.label;
        this._visible = parameters.visible ?? true;
    }

    public getName(): string {
        return this._name;
    }

    public getTab(): IFormTab | undefined {
        return this._tab;
    }

    public getLabel(): string | undefined {
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

    public getControls(): IFormControl[] {
        return this._form.controls.getAll().filter(control => control.getSection() === this);
    }
}
