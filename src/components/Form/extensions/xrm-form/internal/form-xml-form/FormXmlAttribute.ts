import { EventEmitter, IEventEmitter, IField, IFieldValidationResult } from "@talxis/client-libraries";
import type { IFormXmlAttribute, IFormXmlAttributeEvents, RequiredLevelEnum } from "./interfaces";

export class FormXmlAttribute implements IFormXmlAttribute {
    public readonly events: IEventEmitter<IFormXmlAttributeEvents> = new EventEmitter<IFormXmlAttributeEvents>();

    private _validation: IFieldValidationResult | null = null;
    private _requiredLevel: RequiredLevelEnum | null = null;
    private _field: IField;

    constructor(field: IField) {
        this._field = field;
    }

    public getValidation(): IFieldValidationResult | null {
        return this._validation;
    }

    public setValidation(validation: IFieldValidationResult): void {
        if (this._validation?.error === validation.error && this._validation?.errorMessage === validation.errorMessage) return;
        this._validation = validation;
        this.events.dispatchEvent("onValidationChanged", validation);
    }

    public getRequiredLevel(): RequiredLevelEnum | null {
        return this._requiredLevel;
    }

    public setRequiredLevel(requiredLevel: RequiredLevelEnum): void {
        if (this._requiredLevel === requiredLevel) return;
        this._requiredLevel = requiredLevel;
        this.events.dispatchEvent("onRequiredLevelChanged", requiredLevel);
    }

    public getField(): IField {
        return this._field;
    }
}
