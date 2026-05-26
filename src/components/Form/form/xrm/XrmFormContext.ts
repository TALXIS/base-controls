import type { FormModel } from "../FormModel";

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
    private _tabName: string;
    private _sectionName: string;
    private _form: FormModel;

    constructor(form: FormModel, tabName: string, sectionName: string) {
        this._form = form;
        this._tabName = tabName;
        this._sectionName = sectionName;
    }

    getName(): string { return this._sectionName; }
    getLabel(): string { return this._sectionName; }
    setLabel(_label: string): void { /* not tracked */ }
    getVisible(): boolean { return this._form.getSectionVisible(this._tabName, this._sectionName); }
    setVisible(visible: boolean): void { this._form.setSectionVisible(this._tabName, this._sectionName, visible); }

    get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.Control> {
        return makeItemCollection([], () => "") as any;
    }
}

class XrmTab {
    private _tabName: string;
    private _form: FormModel;
    private _sections: XrmSection[];

    constructor(form: FormModel, tabName: string) {
        this._form = form;
        this._tabName = tabName;
        const tab = form.getFormXml()?.tabs?.tab?.find((t) => t.name === tabName);
        this._sections = (tab?.columns?.column ?? [])
            .flatMap((c) => c.sections?.section ?? [])
            .filter((s) => !!s.name)
            .map((s) => new XrmSection(form, tabName, s.name!));
    }

    getName(): string { return this._tabName; }
    getLabel(): string { return this._tabName; }
    setLabel(_label: string): void { /* not tracked */ }
    getVisible(): boolean { return this._form.getTabVisible(this._tabName); }
    setVisible(visible: boolean): void { this._form.setTabVisible(this._tabName, visible); }
    getDisplayState(): Xrm.DisplayState { return "expanded"; }
    setDisplayState(_state: Xrm.DisplayState): void { /* noop */ }
    setFocus(): void { /* noop */ }

    get sections(): Xrm.Collection.ItemCollection<Xrm.Controls.Section> {
        return makeItemCollection(this._sections, (s) => s.getName()) as any;
    }
}

class XrmAttribute {
    private _name: string;
    private _form: FormModel;

    constructor(form: FormModel, name: string) {
        this._form = form;
        this._name = name;
    }

    getName(): string { return this._name; }
    getValue(): any { return this._form.getValue(this._name); }
    setValue(value: any): void { this._form.setValue(this._name, value); }

    getAttributeType(): Xrm.Attributes.AttributeType {
        const entity = this._form.getEntityDefinition();
        const attr = entity?.Attributes?.find((a) => a.LogicalName === this._name);
        if (!attr) return "string";
        const t = String(attr.AttributeType ?? "").toLowerCase();
        if (t === "boolean") return "boolean";
        if (t === "integer" || t === "bigint") return "integer";
        if (t === "decimal" || t === "double") return "decimal";
        if (t === "money") return "money";
        if (t === "datetime") return "datetime";
        if (t === "lookup" || t === "customer" || t === "owner") return "lookup";
        if (t === "picklist" || t === "state" || t === "status") return "optionset";
        if (t === "memo") return "memo";
        return "string";
    }

    getRequiredLevel(): Xrm.Attributes.RequirementLevel {
        const override = this._form.getRequiredLevelOverride(this._name);
        if (override !== undefined) return override;
        let level: string | undefined;
        try {
            level = this._form.getAttributeConfiguration(this._name).requiredLevel;
        } catch {
            level = "none";
        }
        if (level === "required") return "required";
        if (level === "recommended") return "recommended";
        return "none";
    }

    setRequiredLevel(level: Xrm.Attributes.RequirementLevel): void {
        this._form.setRequiredLevelOverride(this._name, level);
    }

    getIsDirty(): boolean { return false; }
    setSubmitMode(_mode: Xrm.SubmitMode): void { /* noop */ }
    getSubmitMode(): Xrm.SubmitMode { return "dirty"; }
    fireOnChange(): void { /* noop */ }
    addOnChange(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    removeOnChange(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    getUserPrivilege(): Xrm.Privilege { return { canRead: true, canUpdate: true, canCreate: true }; }

    get controls(): Xrm.Collection.ItemCollection<Xrm.Controls.StandardControl> {
        return makeItemCollection([], () => "") as any;
    }
}

class XrmControl {
    private _controlId: string;
    private _form: FormModel;

    constructor(form: FormModel, controlId: string) {
        this._form = form;
        this._controlId = controlId;
    }

    getName(): string { return this._controlId; }
    getVisible(): boolean { return this._form.getControlVisible(this._controlId); }
    setVisible(visible: boolean): void { this._form.setControlVisible(this._controlId, visible); }
    getDisabled(): boolean { return this._form.getControlDisabled(this._controlId); }
    setDisabled(disabled: boolean): void { this._form.setControlDisabled(this._controlId, disabled); }

    getLabel(): string {
        const override = this._form.getControlLabel(this._controlId);
        if (override !== undefined) return override;
        const cell = this._form.findCellByControlId(this._controlId);
        const dfn = cell?.control?.datafieldname;
        return this._form.getFieldLabel(dfn ?? this._controlId, cell?.control);
    }

    setLabel(label: string): void { this._form.setControlLabel(this._controlId, label); }

    getAttribute(): Xrm.Attributes.Attribute | null {
        const cell = this._form.findCellByControlId(this._controlId);
        const dfn = cell?.control?.datafieldname;
        if (!dfn) return null;
        return new XrmAttribute(this._form, dfn) as any;
    }

    getControlType(): Xrm.Controls.ControlType { return "standard"; }
    focus(): void { /* noop */ }
    addNotification(_notification: any): void { /* noop */ }
    clearNotification(_uniqueId?: string): void { /* noop */ }
}

class XrmEntity {
    private _form: FormModel;

    constructor(form: FormModel) {
        this._form = form;
    }

    getId(): string { return this._form.getRecord()?.getRecordId?.() ?? ""; }
    getEntityName(): string {
        const namedReference = this._form.getRecord()?.getNamedReference?.() as any;
        return namedReference?.entityType ?? namedReference?.etn ?? "";
    }
    getEntityReference(): Xrm.EntityReference {
        return {
            id: this.getId(),
            entityType: this.getEntityName(),
            name: (this._form.getRecord()?.getNamedReference?.() as any)?.name ?? "",
        } as any;
    }
    getPrimaryAttributeValue(): string { return ""; }
    isValid(): boolean { return true; }
    addOnSave(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    removeOnSave(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    save(_saveMode?: string): void { notImplemented("data.entity.save"); }

    get attributes(): Xrm.Collection.ItemCollection<Xrm.Attributes.Attribute> {
        return makeItemCollection([], () => "") as any;
    }
}

class XrmData {
    private _form: FormModel;
    readonly entity: any;
    readonly attributes: any;
    readonly process: any;

    constructor(form: FormModel) {
        this._form = form;
        this.entity = new XrmEntity(form);
        this.attributes = makeItemCollection([], () => "");
        this.process = {};
    }

    getIsDirty(): boolean { return this._form.isDirty(); }
    isValid(): boolean { return true; }
    addOnLoad(_handler: Xrm.Events.DataLoadEventHandler): void { /* noop */ }
    removeOnLoad(_handler: Xrm.Events.DataLoadEventHandler): void { /* noop */ }
    save(_saveOptions?: any): Xrm.Async.PromiseLike<any> { notImplemented("data.save"); }
    refresh(_save?: boolean): Xrm.Async.PromiseLike<any> { notImplemented("data.refresh"); }
}

class XrmUi {
    readonly tabs: any;
    readonly controls: any;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;

    constructor(form: FormModel) {
        const tabs = (form.getFormXml()?.tabs?.tab ?? [])
            .filter((t) => !!t.name)
            .map((t) => new XrmTab(form, t.name!));

        this.tabs = makeItemCollection(tabs, (t) => t.getName());
        this.controls = makeItemCollection([], () => "");
        this.formSelector = {
            items: makeItemCollection([], () => ""),
            getCurrentItem: () => null,
        };
        this.navigation = {
            items: makeItemCollection([], () => ""),
        };
        this.process = {};
        this.footerSection = {};
        this.quickForms = makeItemCollection([], () => "");
    }

    getFormType(): XrmEnum.FormType { return 2; }
    getViewPortWidth(): number { return 0; }
    getViewPortHeight(): number { return 0; }
    refreshRibbon(_refreshAll?: boolean): void { /* noop */ }
    setFormEntityName(_name: string): void { /* noop */ }
    addOnLoad(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    removeOnLoad(_handler: Xrm.Events.ContextSensitiveHandler): void { /* noop */ }
    setFormNotification(_message: string, _level: string, _uniqueId: string): boolean { return true; }
    clearFormNotification(_uniqueId: string): boolean { return true; }
    close(): void { /* noop */ }
}

export class XrmFormContext {
    private _form: FormModel;
    readonly data: any;
    readonly ui: any;

    constructor(form: FormModel) {
        this._form = form;
        this.data = new XrmData(form);
        this.ui = new XrmUi(form);
    }

    getAttribute(nameOrIndexOrDelegate?: any): any {
        if (nameOrIndexOrDelegate === undefined || nameOrIndexOrDelegate === null) {
            return [];
        }
        if (typeof nameOrIndexOrDelegate === "string") {
            return new XrmAttribute(this._form, nameOrIndexOrDelegate) as any;
        }
        if (typeof nameOrIndexOrDelegate === "function") {
            return [];
        }
        notImplemented("getAttribute with index");
    }

    getControl(nameOrIndexOrDelegate?: any): any {
        if (nameOrIndexOrDelegate === undefined || nameOrIndexOrDelegate === null) {
            return [];
        }
        if (typeof nameOrIndexOrDelegate === "string") {
            return new XrmControl(this._form, nameOrIndexOrDelegate) as any;
        }
        if (typeof nameOrIndexOrDelegate === "function") {
            return [];
        }
        notImplemented("getControl with index");
    }
}
