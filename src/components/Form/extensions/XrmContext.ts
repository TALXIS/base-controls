import { IField } from "@talxis/client-libraries";
import { Form } from "../Form";
import { IFormXmlCell, IFormXmlModel, IFormXmlSection, IFormXmlTab } from "./form-xrm/FormXmlForm";
import { DataTypes } from "@talxis/client-libraries/dist/utils";

function makeItemCollection<T>(items: T[], getNameFn: (item: T) => string): Xrm.Collection.ItemCollection<T> {
    return {
        get: (selectorOrIndex?: string | number | ((item: T, index: number) => boolean)) => {
            if (selectorOrIndex === undefined || selectorOrIndex === null) {
                return items as any;
            }
            if (typeof selectorOrIndex === "string") {
                return (items.find((i) => getNameFn(i) === selectorOrIndex) ?? null) as any;
            }
            if (typeof selectorOrIndex === "number") {
                return (items[selectorOrIndex] ?? null) as any;
            }
            if (typeof selectorOrIndex === "function") {
                return items.filter(selectorOrIndex) as any;
            }
            return null as any;
        },
        getLength: () => items.length,
        forEach: (cb: (item: T, index: number) => void) => {
            items.forEach((item, idx) => cb(item, idx));
        },
    } as any;
}

function notImplemented(name: string): never {
    throw new Error(`[XrmFormContext] ${name} is not implemented.`);
}

class XrmSection {
    private _section: IFormXmlSection;

    constructor(formXmlModel: IFormXmlModel, name: string) {
        const section = formXmlModel.getSections().find((s) => s.name === name)!;
        if (!section) {
            throw new Error(`[XrmSection] Section with name "${name}" not found.`);
        }
        this._section = section;
    }

    public getName(): string {
        return this._section.name ?? '';
    }

    public getLabel(): string {
        return this._section.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._section.setLabel(label);
    }

    public getVisible(): boolean {
        return this._section.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._section.setVisible(visible);
    }

    public get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.Control> {
        //TODO: implement me!
        return makeItemCollection([], () => "") as any;
    }
}

class XrmTab {
    private _tab: IFormXmlTab;

    constructor(formXmlModel: IFormXmlModel, name: string) {
        const tab = formXmlModel.getTabs().find((t) => t.name === name);
        if (!tab) {
            throw new Error(`[XrmTab] Tab with name "${name}" not found.`);
        }
        this._tab = tab;
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
        notImplemented("XrmTab.getDisplayState");
    }

    public setDisplayState(state: Xrm.DisplayState): void {
        notImplemented("XrmTab.setDisplayState");
    }

    public setFocus(): void {
        notImplemented("XrmTab.setFocus");
    }


    public get sections(): Xrm.Collection.ItemCollection<Xrm.Controls.Section> {
        //TODO: implement me!
        //@ts-ignore
        return makeItemCollection(this._sections, (s) => s.getName()) as any;
    }
}

class XrmAttribute {
    private _name: string;
    private _formXmlModel: IFormXmlModel;
    private _onChangeHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formXmlModel: IFormXmlModel, name: string) {
        this._formXmlModel = formXmlModel;
        this._name = name;
        this._registerEventListeners();
    }

    public getName(): string {
        return this._name;
    }
    public getValue(): any {
        return this._getField().getValue();
    }
    public setValue(value: any): void {
        this._getField().setValue(value);
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
        this._formXmlModel.getForm().setFieldRequiredLevel(this._name, Form.getRequiredLevelEnumFromXrm(level));
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
        return 'dirty'
    }

    public setSubmitMode(mode: Xrm.SubmitMode): void {
        notImplemented("XrmAttribute.setSubmitMode");
    }
    /**
     * Triggers all OnChange handlers (FormXml-declared and code-registered) for this attribute.
     */
    public fireOnChange(): void {
        this._onChangeHandlerSet.forEach((handler) => {
            try {
                handler({} as any);
            } catch (err) {
                console.error(`[Form] XrmAttribute.onChange handler failed for attribute "${this._name}":`, err);
            }
        });
    }

    /**
     * Registers a handler to be invoked when this attribute's value changes.
     * The execution context is automatically passed as the first argument.
     */
    public addOnChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onChangeHandlerSet.add(handler);
    }

    /**
     * Removes a previously registered OnChange handler for this attribute.
     */
    public removeOnChange(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onChangeHandlerSet.delete(handler);
    }

    public getUserPrivilege(): Xrm.Privilege { return { canRead: true, canUpdate: true, canCreate: true }; }

    public get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StandardControl> {
        return makeItemCollection([], () => "") as any;
    }

    private _getField(): IField {
        return this._formXmlModel.getForm().getField(this._name);
    }

    private _registerEventListeners() {
        this._formXmlModel.getForm().events.addEventListener('onFieldValueChanged', (fieldName: string, newValue: any) => {
            if (fieldName !== this._name) return;
            this.fireOnChange();
        });
    }
}

class XrmControl {
    private _controlId: string;
    private _formXmlModel: IFormXmlModel;
    private _cell: IFormXmlCell;

    constructor(formXmlModel: IFormXmlModel, controlId: string) {
        this._formXmlModel = formXmlModel;
        this._controlId = controlId;
        const cell = formXmlModel.getCells().find((c) => c.control?.id === controlId);
        if (!cell) {
            throw new Error(`[XrmControl] Controls that are not part of a cell are not supported. ControlId: ${controlId}`);
        }
        this._cell = cell;
    }

    public getName(): string {
        return this._controlId;
    }

    public getVisible(): boolean {
        return this._cell.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._cell.setVisible(visible);
    }

    public getDisabled(): boolean {
        return this._cell.getDisabled();
    }

    public setDisabled(disabled: boolean): void {
        this._cell.setDisabled(disabled);
    }

    public getLabel(): string {
        return this._cell.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._cell.setLabel(label);
    }

    public getAttribute(): Xrm.Attributes.Attribute | null {
        //TODO: IMPLEMENT ME!
        throw new Error("XrmControl.getAttribute is not implemented yet.");
    }

    public getControlType(): Xrm.Controls.ControlType {
        return 'standard';
    }
    public focus(): void {
        notImplemented("XrmControl.focus");
    }

    public addNotification(notification: any) {
        notImplemented("XrmControl.addNotification");
    }
    public clearNotification(uniqueId?: string) {
        notImplemented("XrmControl.clearNotification");
    }
}

class XrmEntity {
    private _formXmlModel: IFormXmlModel;
    private _onSaveHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
    }

    public getId(): string {
        return this._getRecordReference().id.guid;
    }

    public getEntityName(): string {
        return this._getRecordReference().etn ?? '';
    }

    public getEntityReference(): Xrm.EntityReference {
        const recordReference = this._getRecordReference();
        return {
            Id: recordReference.id.guid,
            TypeName: recordReference.etn ?? '',
            Name: recordReference.name ?? '',
            TypeCode: 0
        }
    }

    public getPrimaryAttributeValue(): string {
        return this._formXmlModel.getForm().getMetadata().PrimaryNameAttribute;
    }
    public isValid(): boolean {
        return this._formXmlModel.getForm().isValid();
    }

    public addOnSave(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onSaveHandlerSet.add(handler);
    }

    public removeOnSave(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onSaveHandlerSet.delete(handler);
    }

    public save(saveMode?: string) {
        this._formXmlModel.getForm().save();
    }

    get attributes(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        return makeItemCollection([], () => "") as any;
    }

    private _getRecordReference(): ComponentFramework.EntityReference {
        return this._formXmlModel.getForm().getRecordReference();
    }
}

class XrmData {
    public readonly entity: any;
    public readonly attributes: any;
    public readonly process: any;

    private _onLoadHandlerSet: Set<Xrm.Events.DataLoadEventHandler> = new Set();
    private _formXmlModel: IFormXmlModel;


    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
        this.entity = new XrmEntity(formXmlModel);
        this.attributes = this._createAttributeCollection();
        this.process = {};
    }

    public getIsDirty(): boolean {
        return this._formXmlModel.getForm().isDirty();
    }

    public isValid(): boolean {
        return this._formXmlModel.getForm().isValid();
    }

    public save(saveOptions?: any) {
        return this._formXmlModel.getForm().save();
    }

    public refresh(save?: boolean): Xrm.Async.PromiseLike<any> {
        notImplemented("data.refresh");
    }

    public addOnLoad(handler: Xrm.Events.DataLoadEventHandler): void {
        this._onLoadHandlerSet.add(handler);
    }

    public removeOnLoad(handler: Xrm.Events.DataLoadEventHandler): void {
        this._onLoadHandlerSet.delete(handler);
    }

    private _createAttributeCollection(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        const fields = this._formXmlModel.getForm().getFields();
        const attributes = fields.map((f) => new XrmAttribute(this._formXmlModel, f.getColumn().name));
        return makeItemCollection(attributes, (a) => a.getName()) as any;
    }
}

class XrmUi {
    readonly tabs: any;
    readonly controls: Xrm.Collection.ItemCollection<Xrm.Controls.Control>;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;

    private _formXmlModel: IFormXmlModel;

    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
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
        notImplemented("ui.refreshRibbon");
    }

    public setFormEntityName(name: string): void {
        notImplemented("ui.setFormEntityName");
    }

    public addOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void {
        notImplemented("ui.addOnLoad");
    }
    public removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void {
        notImplemented("ui.removeOnLoad");
    }

    public setFormNotification(message: string, level: string, uniqueId: string): boolean {
        //TODO: implement me!
        return true;
    }
    public clearFormNotification(uniqueId: string): boolean {
        //TODO: implement me!
        return true;
    }
    public close(): void {
        notImplemented("ui.close");
    }

    private _createControlsCollection(): Xrm.Collection.ItemCollection<Xrm.Controls.Control> {
        const controls = this._formXmlModel.getControls();
        return makeItemCollection(controls.map((c) => new XrmControl(this._formXmlModel, c.id!)), (c) => c.getName()) as any;
    }
}

export class XrmFormContext {
    private _formXmlModel: IFormXmlModel;
    readonly data: XrmData;
    readonly ui: XrmUi;

    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
        this.data = new XrmData(formXmlModel);
        this.ui = new XrmUi(formXmlModel);
    }

    public getAttribute(nameOrIndexOrDelegate?: any): any {
        return this.data.attributes.get(nameOrIndexOrDelegate);
    }

    public getControl(nameOrIndexOrDelegate?: any): any {
        return this.ui.controls.get(nameOrIndexOrDelegate);
    }

    public getFormXmlModel(): IFormXmlModel {
        return this._formXmlModel;
    }
}