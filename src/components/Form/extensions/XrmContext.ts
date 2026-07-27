import { IField } from "@talxis/client-libraries";
import { Form } from "../Form";
import { IFormXmlAttribute, IFormXmlCell, IFormXmlControl, IFormXmlModel, IFormXmlSection, IFormXmlTab, INotification } from "./form-xrm/FormXmlForm";
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

    private _formContext: XrmFormContext;
    private _section: IFormXmlSection;

    constructor(section: IFormXmlSection, formContext: XrmFormContext) {
        this._formContext = formContext;
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

    public get controls(): Xrm.Collection.ItemCollection<XrmControl> {
        const controls = this._formContext.ui.controls.get();
        const sectionFormXmlControlsMap = new Map(this._section.getControls().map((c) => [c.id, c]));
        const sectionControls = controls.filter((c) => sectionFormXmlControlsMap.has(c.getName()));
        return makeItemCollection(sectionControls, (c) => c.getName()) as any;
    }
}

class XrmTab {
    public readonly sections: Xrm.Collection.ItemCollection<XrmSection>;
    private _tab: IFormXmlTab;
    private _formContext: XrmFormContext;
    private _tabStateChangeHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(tab: IFormXmlTab, formContext: XrmFormContext) {
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

    private _createSectionsCollection(): Xrm.Collection.ItemCollection<XrmSection> {
        const sections = this._tab.getSections();
        return makeItemCollection(sections.map((s) => new XrmSection(s, this._formContext)), (s) => s.getName()) as any;
    }

    private _registerEventListeners() {
        this._formContext.getFormXmlModel().tabs.events.addEventListener('onTabFocusChanged', (tabId: string, focused: boolean) => {
            if (tabId !== this._tab.id) return;
            this._fireOnTabStateChange();
        });
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

}

class XrmAttribute {
    private _attribute: IFormXmlAttribute;
    private _field: IField;
    private _formContext: XrmFormContext;
    private _onChangeHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(attribute: IFormXmlAttribute, formContext: XrmFormContext) {
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

    public setIsValid(bool: boolean, message?: string): void {
        this._attribute.setValidation({
            error: !bool,
            errorMessage: message ?? ''
        })
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
        this._attribute.setRequiredLevel(Form.getRequiredLevelEnumFromXrm(level));
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

    public get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StandardControl> {
        const allControls = this._formContext.ui.controls.get();
        const attributeControls = allControls.filter((c) => c.getAttribute()?.getName() === this.getName());
        return makeItemCollection(attributeControls, (c) => c.getName()) as any;
    }


    private _getField(): IField {
        return this._getFormXmlModel().getForm().getField(this.getName());
    }

    private _registerEventListeners() {
        this._getFormXmlModel().getForm().events.addEventListener('onFieldValueChanged', (fieldName: string, newValue: any) => {
            if (fieldName !== this.getName()) return;
            this.fireOnChange();
        });
    }

    private _getFormXmlModel(): IFormXmlModel {
        return this._formContext.getFormXmlModel();
    }
}

class XrmControl {
    private _control: IFormXmlControl;
    private _formContext: XrmFormContext;
    private _cell: IFormXmlCell;

    constructor(control: IFormXmlControl, formContext: XrmFormContext) {
        this._formContext = formContext;
        this._control = control;
        this._cell = control.getCell();
    }

    public getName(): string {
        return this._control.id ?? '';
    }

    public getVisible(): boolean {
        return this._cell.getVisible();
    }

    public setVisible(visible: boolean): void {
        this._cell.setVisible(visible);
    }

    public getDisabled(): boolean {
        return this._control.getDisabled();
    }

    public setDisabled(disabled: boolean): void {
        this._control.setDisabled(disabled);
    }

    public getLabel(): string {
        return this._cell.getLabel() ?? '';
    }

    public setLabel(label: string): void {
        this._cell.setLabel(label);
    }

    public getAttribute(): XrmAttribute | null {
        if (this._control.datafieldname) {
            return this._formContext.data.attributes.get(this._control.datafieldname) as any;
        }
        return null;
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
    private _formContext: XrmFormContext;
    private _onSaveHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
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
        return this._getFormXmlModel().getForm().getMetadata().PrimaryNameAttribute;
    }
    public isValid(): boolean {
        return this._getFormXmlModel().getForm().isValid();
    }

    public addOnSave(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onSaveHandlerSet.add(handler);
    }

    public removeOnSave(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onSaveHandlerSet.delete(handler);
    }

    public save(saveMode?: string) {
        this._getFormXmlModel().getForm().save();
    }

    get attributes(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        return this._formContext.data.attributes;
    }

    private _getRecordReference(): ComponentFramework.EntityReference {
        return this._getFormXmlModel().getForm().getRecordReference();
    }

    private _getFormXmlModel(): IFormXmlModel {
        return this._formContext.getFormXmlModel();
    }
}

class XrmData {
    public readonly entity: any;
    public readonly attributes: Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute>;
    public readonly process: any;

    private _onLoadHandlerSet: Set<Xrm.Events.DataLoadEventHandler> = new Set();
    private _formContext: XrmFormContext;


    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
        this.entity = new XrmEntity(formContext);
        this.attributes = this._createAttributeCollection();
        this.process = {};
    }

    public getIsDirty(): boolean {
        return this._getFormXmlModel().getForm().isDirty();
    }

    public isValid(): boolean {
        return this._getFormXmlModel().getForm().isValid();
    }

    public save(saveOptions?: any) {
        return this._getFormXmlModel().getForm().save();
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
        const attributes = this._getFormXmlModel().getAttributes();
        const xrmAttributes = attributes.map((a) => new XrmAttribute(a, this._formContext));
        return makeItemCollection(xrmAttributes, (a) => a.getName()) as any;
    }

    private _getFormXmlModel(): IFormXmlModel {
        return this._formContext.getFormXmlModel();
    }
}

class XrmUi {
    readonly tabs: Xrm.Collection.ItemCollection<XrmTab>;
    readonly controls: Xrm.Collection.ItemCollection<XrmControl>;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;

    private _formContext: XrmFormContext;
    private _notificationMap: Map<string, INotification> = new Map();
    private _onLoadHandlerSet: Set<Xrm.Events.ContextSensitiveHandler> = new Set();

    constructor(formContext: XrmFormContext) {
        this._formContext = formContext;
        this.tabs = this._createTabsCollection();
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
        this._onLoadHandlerSet.add(handler);
    }
    public removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void {
        this._onLoadHandlerSet.delete(handler);
    }

    public setFormNotification(message: string, level: INotification['level'], uniqueId: string): boolean {
        this._notificationMap.set(uniqueId ?? crypto.randomUUID(), { message, level });
        this._getFormXmlModel().setNotifications(Array.from(this._notificationMap.values()));
        return true;
    }
    public clearFormNotification(uniqueId: string): boolean {
        const result = this._notificationMap.delete(uniqueId);
        if (result) {
            this._getFormXmlModel().setNotifications(Array.from(this._notificationMap.values()));
        }
        return result;
    }
    public close(): void {
        notImplemented("ui.close");
    }

    private _createControlsCollection(): Xrm.Collection.ItemCollection<XrmControl> {
        const controls = this._getFormXmlModel().getControls();
        return makeItemCollection(controls.map((c) => new XrmControl(c, this._formContext)), (c) => c.getName()) as any;
    }

    private _createTabsCollection(): Xrm.Collection.ItemCollection<XrmTab> {
        const tabs = this._getFormXmlModel().getTabs();
        return makeItemCollection(tabs.map((t) => new XrmTab(t, this._formContext)), (t) => t.getName()) as any;
    }

    private _getFormXmlModel(): IFormXmlModel {
        return this._formContext.getFormXmlModel();
    }
}

export class XrmFormContext {
    private _formXmlModel: IFormXmlModel;
    readonly data: XrmData;
    readonly ui: XrmUi;

    constructor(formXmlModel: IFormXmlModel) {
        this._formXmlModel = formXmlModel;
        this.data = new XrmData(this);
        this.ui = new XrmUi(this);
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