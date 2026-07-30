export interface IXrmSectionContext {
    getName(): string;
    getLabel(): string;
    setLabel(label: string): void;
    getVisible(): boolean;
    setVisible(visible: boolean): void;
    controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
}

export interface IXrmTabContext {
    readonly sections: Xrm.Collection.ItemCollection<IXrmSectionContext>;
    getName(): string;
    getLabel(): string;
    setLabel(label: string): void;
    getVisible(): boolean;
    setVisible(visible: boolean): void;
    getDisplayState(): Xrm.DisplayState;
    setDisplayState(state: Xrm.DisplayState): void;
    setFocus(): void;
    addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
}

export interface IXrmAttributeContext {
    getName(): string;
    getValue(): any;
    setValue(value: any): void;
    setIsValid(bool: boolean, message?: string): void;
    getAttributeType(): Xrm.Attributes.AttributeType;
    getRequiredLevel(): Xrm.Attributes.RequirementLevel;
    setRequiredLevel(level: Xrm.Attributes.RequirementLevel): void;
    addOption(option: { value: number; text?: string }, index?: number): void;
    removeOption(value: number): void;
    getIsDirty(): boolean;
    getSubmitMode(): Xrm.SubmitMode;
    setSubmitMode(mode: Xrm.SubmitMode): void;
    fireOnChange(): void;
    addOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    removeOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    getUserPrivilege(): Xrm.Privilege;
    controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
}

export interface IXrmControlContext {
    getName(): string;
    getVisible(): boolean;
    setVisible(visible: boolean): void;
    getDisabled(): boolean;
    setDisabled(disabled: boolean): void;
    getLabel(): string;
    setLabel(label: string): void;
    getAttribute(): IXrmAttributeContext | null;
    getControlType(): Xrm.Controls.ControlType;
    focus(): void;
    addNotification(notification: any): void;
    clearNotification(uniqueId?: string): void;
}

export interface IXrmEntityContext {
    getId(): string;
    getEntityName(): string;
    getEntityReference(): Xrm.EntityReference;
    getPrimaryAttributeValue(): string;
    isValid(): boolean;
    addOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
    removeOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
    save(saveOptions?: Xrm.SaveOptions): Promise<void>;
    attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
}

export interface IXrmDataContext {
    readonly entity: IXrmEntityContext;
    readonly attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
    readonly process: any;
    getIsDirty(): boolean;
    isValid(): boolean;
    save(saveOptions?: Xrm.SaveOptions): Promise<void>;
    refresh(save?: boolean): Xrm.Async.PromiseLike<any>;
    addOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
    removeOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
}

export interface IXrmUiContext {
    readonly tabs: Xrm.Collection.ItemCollection<IXrmTabContext>;
    readonly controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
    readonly formSelector: any;
    readonly navigation: any;
    readonly process: any;
    readonly footerSection: any;
    readonly quickForms: any;
    getFormType(): XrmEnum.FormType;
    getViewPortHeight(): number;
    getViewPortWidth(): number;
    refreshRibbon(refreshAll?: boolean): void;
    setFormEntityName(name: string): void;
    addOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
    removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
    setFormNotification(message: string, level: 'ERROR' | 'WARNING' | 'INFO', uniqueId: string): boolean;
    clearFormNotification(uniqueId: string): boolean;
    close(): void;
}

export interface IXrmFormContext {
    readonly data: IXrmDataContext;
    readonly ui: IXrmUiContext;
    getAttribute(nameOrIndexOrDelegate?: any): any;
    getControl(nameOrIndexOrDelegate?: any): any;
}
