import { IField } from "@talxis/client-libraries";
import { DataTypes } from "@talxis/client-libraries/dist/utils";
import { FormModel } from "@components/Form/internal/FormModel";
import type { IFormXmlAttribute } from "../form-xml-form";
import { makeItemCollection } from "./collection";
import type { IXrmAttributeContext, IXrmControlContext } from "../../interfaces";
import type { IXrmFormContextInternal } from "./XrmFormContext";
import { notImplemented } from "./utils";

export class XrmAttribute implements IXrmAttributeContext {
    private _attribute: IFormXmlAttribute;
    private _field: IField;
    private _formContext: IXrmFormContextInternal;
    private _onChangeHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(attribute: IFormXmlAttribute, formContext: IXrmFormContextInternal) {
        this._attribute = attribute;
        this._field = attribute.getField();
        this._formContext = formContext;
        this._registerEventListeners();
    }

    public getName(): string {
        return this._field.getColumn().name;
    }

    public getValue(): any {
        return this._getField().getValue();
    }

    public setValue(value: any): void {
        this._getField().setValue(value);
    }

    public setIsValid(isValid: boolean, message?: string): void {
        this._attribute.setValidation({
            error: !isValid,
            errorMessage: message ?? ''
        });
    }

    public getAttributeType(): Xrm.Attributes.AttributeType {
        const dataType = this._getField().getColumn().dataType;
        switch (dataType) {
            case DataTypes.TwoOptions:
                return "boolean";
            case DataTypes.WholeNone:
            case DataTypes.WholeDuration:
            case DataTypes.WholeLanguage:
            case DataTypes.WholeTimeZone:
                return "integer";
            case DataTypes.Decimal:
                return "decimal";
            case DataTypes.Currency:
                return "money";
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly:
                return "datetime";
            case DataTypes.LookupSimple:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupRegarding:
                return "lookup";
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet:
                return "optionset";
            case DataTypes.Multiple:
                return "memo";
            case DataTypes.SingleLineText:
            case DataTypes.SingleLineTextArea:
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLinePhone:
            case DataTypes.SingleLineUrl:
            default:
                return "string";
        }
    }

    public getRequiredLevel(): Xrm.Attributes.RequirementLevel {
        return this._getField().getRequiredLevel();
    }

    public setRequiredLevel(level: Xrm.Attributes.RequirementLevel): void {
        this._attribute.setRequiredLevel(FormModel.getRequiredLevelEnumFromXrm(level));
    }

    public addOption(option: { value: number; text?: string }, index?: number): void {
        notImplemented("XrmAttribute.addOption");
    }

    public removeOption(value: number): void {
        notImplemented("XrmAttribute.removeOption");
    }

    public getIsDirty(): boolean {
        return this._getField().isDirty();
    }

    public getSubmitMode(): Xrm.SubmitMode {
        return 'dirty';
    }

    public setSubmitMode(mode: Xrm.SubmitMode): void {
        notImplemented("XrmAttribute.setSubmitMode");
    }

    public fireOnChange(): void {
        this._onChangeHandlerSet.forEach((handler) => {
            try {
                handler({} as any);
            } catch (err) {
                console.error(`[Form] XrmAttribute.onChange handler failed for attribute "${this._field.getColumn().name}":`, err);
            }
        });
    }

    public addOnChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onChangeHandlerSet.add(handler);
    }

    public removeOnChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onChangeHandlerSet.delete(handler);
    }

    public getUserPrivilege(): Xrm.Privilege {
        return { canRead: true, canUpdate: true, canCreate: true };
    }

    public get controls(): Xrm.Collection.ItemCollection<IXrmControlContext> {
        const allControls = this._formContext.ui.controls.get();
        const attributeControls = allControls.filter((c) => c.getAttribute()?.getName() === this.getName());
        return makeItemCollection(attributeControls, (c) => c.getName()) as any;
    }

    private _getField(): IField {
        return this._formContext.getFormXmlModel().getForm().getField(this.getName());
    }

    private _registerEventListeners() {
        this._formContext.getFormXmlModel().getForm().events.addEventListener('onFieldValueChanged', this._formFieldValueChangedHandler);
        this._formContext.getFormXmlModel().getForm().events.addEventListener('onDestroy', this._formDestroyedHandler);
    }

    private _formFieldValueChangedHandler = (fieldName: string): void => {
        if (fieldName !== this.getName()) return;
        this.fireOnChange();
    };

    private _formDestroyedHandler = (): void => {
        this._onChangeHandlerSet.clear();
    };
}
