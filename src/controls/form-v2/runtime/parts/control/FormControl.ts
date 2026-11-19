import { EventEmitter, IField } from "@talxis/client-libraries";
import type { IEventSubscriber } from "@core";
import type { IFormTab } from "../tab/FormTab";
import type { IFormSection } from "../section/FormSection";

/** What a control raises. */
export interface IFormControlEvents {
    /** Fires when the control is shown or hidden. */
    onVisibleChanged: (visible: boolean) => void;
    /** Fires when the control is disabled or enabled. */
    onDisabledChanged: (disabled: boolean) => void;
    /** Fires when the control's label changes. */
    onLabelChanged: (label: string) => void;
}

/** A field drawn on the form with its label. */
export interface IFormControl {
    readonly events: IEventSubscriber<IFormControlEvents>;
    getName(): string;
    getField(): IField;
    /** The tab the control is drawn in, if any. */
    getTab(): IFormTab | undefined;
    /** The section the control is drawn in, if any. */
    getSection(): IFormSection | undefined;
    /** The label set, otherwise the field's display name. */
    getLabel(): string;
    setLabel(label: string): void;
    isVisible(): boolean;
    /** Hides the control with CSS; its field stays bound and validated. */
    setVisible(visible: boolean): void;
    isDisabled(): boolean;
    setDisabled(disabled: boolean): void;
}

export interface IFormControlParameters {
    name: string;
    field: IField;
    tab?: IFormTab;
    section?: IFormSection;
    label?: string;
    visible?: boolean;
    disabled?: boolean;
}

export class FormControl implements IFormControl {
    public readonly events = new EventEmitter<IFormControlEvents>();
    private _name: string;
    private _field: IField;
    private _tab?: IFormTab;
    private _section?: IFormSection;
    private _label?: string;
    private _visible: boolean;
    private _disabled: boolean;

    constructor(parameters: IFormControlParameters) {
        this._name = parameters.name;
        this._field = parameters.field;
        this._tab = parameters.tab;
        this._section = parameters.section;
        this._label = parameters.label;
        this._visible = parameters.visible ?? true;
        this._disabled = parameters.disabled ?? false;
    }

    public getName(): string {
        return this._name;
    }

    public getField(): IField {
        return this._field;
    }

    public getTab(): IFormTab | undefined {
        return this._tab;
    }

    public getSection(): IFormSection | undefined {
        return this._section;
    }

    public getLabel(): string {
        return this._label ?? this._field.getColumn().displayName ?? this._name;
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

    public isDisabled(): boolean {
        return this._disabled;
    }

    public setDisabled(disabled: boolean): void {
        if (this._disabled === disabled) {
            return;
        }
        this._disabled = disabled;
        this.events.dispatchEvent('onDisabledChanged', disabled);
    }
}
