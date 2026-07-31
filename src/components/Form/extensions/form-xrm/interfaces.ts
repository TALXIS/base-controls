import type { IFormApi, IFormEventHandlers } from "@components/Form/interfaces";
import type { IFormLabels } from "@components/Form/labels";
import type { IFormStrategy } from "@components/Form/strategies";

/**
 * Public Xrm section context exposed by `XrmForm`.
 */
export interface IXrmSectionContext {
    /** Returns the section logical name. */
    getName(): string;
    /** Returns the current section label. */
    getLabel(): string;
    /** Updates the section label. */
    setLabel(label: string): void;
    /** Returns whether the section is visible. */
    getVisible(): boolean;
    /** Updates section visibility. */
    setVisible(visible: boolean): void;
    /** Controls rendered within the section. */
    controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
}

/**
 * Public Xrm tab context exposed by `XrmForm`.
 */
export interface IXrmTabContext {
    /** Sections rendered within the tab. */
    readonly sections: Xrm.Collection.ItemCollection<IXrmSectionContext>;
    /** Returns the tab logical name. */
    getName(): string;
    /** Returns the current tab label. */
    getLabel(): string;
    /** Updates the tab label. */
    setLabel(label: string): void;
    /** Returns whether the tab is visible. */
    getVisible(): boolean;
    /** Updates tab visibility. */
    setVisible(visible: boolean): void;
    /** Returns the current display state. */
    getDisplayState(): Xrm.DisplayState;
    /** Sets the display state. */
    setDisplayState(state: Xrm.DisplayState): void;
    /** Moves focus to the tab. */
    setFocus(): void;
    /** Subscribes to display-state changes. */
    addTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    /** Unsubscribes from display-state changes. */
    removeTabStateChange(handler: Xrm.Events.ContextSensitiveHandler): void;
}

/**
 * Public Xrm attribute context exposed by `XrmForm`.
 */
export interface IXrmAttributeContext {
    /** Returns the attribute logical name. */
    getName(): string;
    /** Returns the current in-memory value. */
    getValue(): any;
    /** Updates the current in-memory value. */
    setValue(value: any): void;
    /** Applies a validation result to the attribute. */
    setIsValid(isValid: boolean, message?: string): void;
    /** Returns the Xrm attribute type. */
    getAttributeType(): Xrm.Attributes.AttributeType;
    /** Returns the current required level. */
    getRequiredLevel(): Xrm.Attributes.RequirementLevel;
    /** Updates the required level. */
    setRequiredLevel(level: Xrm.Attributes.RequirementLevel): void;
    /** Adds an option to option-based attributes. */
    addOption(option: { value: number; text?: string }, index?: number): void;
    /** Removes an option from option-based attributes. */
    removeOption(value: number): void;
    /** Indicates whether the attribute is dirty. */
    getIsDirty(): boolean;
    /** Returns the submit mode. */
    getSubmitMode(): Xrm.SubmitMode;
    /** Updates the submit mode. */
    setSubmitMode(mode: Xrm.SubmitMode): void;
    /** Fires the change handlers for the attribute. */
    fireOnChange(): void;
    /** Subscribes to attribute change notifications. */
    addOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    /** Unsubscribes from attribute change notifications. */
    removeOnChange(handler: Xrm.Events.ContextSensitiveHandler): void;
    /** Returns the current user privilege information when available. */
    getUserPrivilege(): Xrm.Privilege;
    /** Controls bound to the attribute. */
    controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
}

/**
 * Public Xrm control context exposed by `XrmForm`.
 */
export interface IXrmControlContext {
    /** Returns the control logical name. */
    getName(): string;
    /** Returns whether the control is visible. */
    getVisible(): boolean;
    /** Updates control visibility. */
    setVisible(visible: boolean): void;
    /** Returns whether the control is disabled. */
    getDisabled(): boolean;
    /** Updates disabled state. */
    setDisabled(disabled: boolean): void;
    /** Returns the current control label. */
    getLabel(): string;
    /** Updates the control label. */
    setLabel(label: string): void;
    /** Returns the bound attribute when the control is data-bound. */
    getAttribute(): IXrmAttributeContext | null;
    /** Returns the control type. */
    getControlType(): Xrm.Controls.ControlType;
    /** Focuses the control. */
    focus(): void;
    /** Adds a control notification. */
    addNotification(notification: any): void;
    /** Clears a control notification. */
    clearNotification(uniqueId?: string): void;
}

/**
 * Public entity context exposed by `XrmForm`.
 */
export interface IXrmEntityContext {
    /** Returns the current record id. */
    getId(): string;
    /** Returns the logical entity name. */
    getEntityName(): string;
    /** Returns the record as an Xrm entity reference. */
    getEntityReference(): Xrm.EntityReference;
    /** Returns the current primary attribute value. */
    getPrimaryAttributeValue(): string;
    /** Indicates whether the form data is currently valid. */
    isValid(): boolean;
    /** Subscribes to entity save handlers. */
    addOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
    /** Unsubscribes from entity save handlers. */
    removeOnSave(handler: Xrm.Events.SaveEventHandler | Xrm.Events.SaveEventHandlerAsync): void;
    /** Triggers a save through the base Form runtime. */
    save(saveOptions?: Xrm.SaveOptions): Promise<void>;
    /** Attributes available on the entity. */
    attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
}

/**
 * Public data context exposed by `XrmForm`.
 */
export interface IXrmDataContext {
    /** Entity-level API. */
    readonly entity: IXrmEntityContext;
    /** Attribute collection for the current form. */
    readonly attributes: Xrm.Collection.ItemCollection<IXrmAttributeContext>;
    /** Reserved process API surface. */
    readonly process: any;
    /** Indicates whether any field is dirty. */
    getIsDirty(): boolean;
    /** Indicates whether the form data is currently valid. */
    isValid(): boolean;
    /** Triggers a save through the base Form runtime. */
    save(saveOptions?: Xrm.SaveOptions): Promise<void>;
    /** Refreshes the underlying form runtime. */
    refresh(save?: boolean): Xrm.Async.PromiseLike<any>;
    /** Subscribes to data-load handlers. */
    addOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
    /** Unsubscribes from data-load handlers. */
    removeOnLoad(handler: Xrm.Events.DataLoadEventHandler): void;
}

/**
 * Public UI context exposed by `XrmForm`.
 */
export interface IXrmUiContext {
    /** Tab collection available in the rendered form. */
    readonly tabs: Xrm.Collection.ItemCollection<IXrmTabContext>;
    /** Control collection available in the rendered form. */
    readonly controls: Xrm.Collection.ItemCollection<IXrmControlContext>;
    /** Reserved form-selector surface. */
    readonly formSelector: any;
    /** Reserved navigation surface. */
    readonly navigation: any;
    /** Reserved process surface. */
    readonly process: any;
    /** Reserved footer surface. */
    readonly footerSection: any;
    /** Reserved quick-forms surface. */
    readonly quickForms: any;
    /** Returns the current form type. */
    getFormType(): XrmEnum.FormType;
    /** Returns the viewport height. */
    getViewPortHeight(): number;
    /** Returns the viewport width. */
    getViewPortWidth(): number;
    /** Requests ribbon refresh. */
    refreshRibbon(refreshAll?: boolean): void;
    /** Overrides the runtime form entity name. */
    setFormEntityName(name: string): void;
    /** Subscribes to UI load handlers. */
    addOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
    /** Unsubscribes from UI load handlers. */
    removeOnLoad(handler: Xrm.Events.ContextSensitiveHandler): void;
    /** Adds a form-level notification. */
    setFormNotification(message: string, level: 'ERROR' | 'WARNING' | 'INFO', uniqueId: string): boolean;
    /** Clears a form-level notification. */
    clearFormNotification(uniqueId: string): boolean;
    /** Requests the host to close the form. */
    close(): void;
}

/**
 * Curated Xrm-like form context exposed by `XrmForm`.
 *
 * This is intentionally a subset of the broader Microsoft Xrm form context API.
 */
export interface IXrmFormContext {
    /** Data API for the current form. */
    readonly data: IXrmDataContext;
    /** UI API for the current form. */
    readonly ui: IXrmUiContext;
    /** Returns an attribute by name, index, or delegate. */
    getAttribute(nameOrIndexOrDelegate?: any): any;
    /** Returns a control by name, index, or delegate. */
    getControl(nameOrIndexOrDelegate?: any): any;
}

/**
 * Strategy contract required by `XrmForm`.
 */
export interface IXrmFormStrategy extends IFormStrategy {
    /**
     * Returns the FormXml definition used to build the Xrm-like layout model.
     */
    onGetFormXml: () => string;
}

/**
 * Payload delivered when `XrmForm` becomes ready.
 */
export interface IOnXrmFormReadyParams {
    /** Public Xrm-like form context. */
    formContext: IXrmFormContext;
    /** Base Form imperative API. */
    api: IFormApi;
}

/**
 * Props for the React `XrmForm` runtime.
 */
export interface IXrmFormProps extends Partial<IFormEventHandlers> {
    /** Strategy responsible for loading/saving the record and supplying FormXml. */
    strategy: IXrmFormStrategy;
    /** Fired when the Xrm-like runtime and the base Form API are ready. */
    onFormReady?: (params: IOnXrmFormReadyParams) => void;
    /** Localized label overrides for the base Form UI. */
    labels?: Partial<IFormLabels>;
}
