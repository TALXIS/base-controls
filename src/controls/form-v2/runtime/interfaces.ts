import type { IField, IFieldValidationResult, IRecord } from "@talxis/client-libraries";
import type { RequiredLevelEnum } from "@talxis/client-metadata";
import type { IEventSubscriber, IRuntime, IRuntimeModule, IRuntimePartMap, IRuntimeParts, IServiceLocator } from "@core";
import type { IFormTabs } from "./parts/tabs/FormTabs";
import type { IFormSections } from "./parts/sections/FormSections";
import type { IFormControls } from "./parts/controls/FormControls";

/** What `onLoad` resolves. */
export interface IFormLoadResult {
    /** Edited in place and never destroyed, so a grid's record can be passed as is. */
    record: IRecord;
}

/** A validation issue the form found. */
export interface IFormValidation extends IFieldValidationResult {
    /** The field the issue is on, when it is on one. */
    fieldName?: string;
}

/** A save about to happen; a blocker sets `isBlocked` to stop it. */
export interface IFormSaveRequest {
    isBlocked: boolean;
}

/** Runs before every save, and may stop it. */
export type FormSaveBlocker = (request: IFormSaveRequest) => Promise<void> | void;

/** What the form raises. */
export interface IFormEvents {
    /** Fires when a field's value changes. */
    onFieldValueChanged: (fieldName: string, value: unknown) => void;
    /** Fires when the validation summary changes. */
    onValidationSummaryChanged: (validationSummary: IFormValidation[]) => void;
    /** Fires when the form turns dirty or clean. */
    onDirtyStateChanged: (isDirty: boolean) => void;
    /** Fires when a save starts. */
    onBeforeSave: () => void;
    /** Fires when a save ends. */
    onAfterSave: (success: boolean) => void;
    /** Fires when a save throws. */
    onSaveFailed: (message: string, error: unknown) => void;
}

/** The parts drawn once inside the form. */
export interface IFormPartMap extends IRuntimePartMap { }

/** The modules a form loaded, by name; each module adds its own entry. */
export interface IFormModuleMap { }

/** A feature of the form, loaded on every mount before its `onLoad`. */
export interface IFormModule<TName extends keyof IFormModuleMap = keyof IFormModuleMap> extends IRuntimeModule<IFormModuleMap, TName, IForm> { }

/** The form as its consumer drives it; a new one for every mount. */
export interface IForm extends IRuntime {
    readonly events: IEventSubscriber<IFormEvents>;
    /** The parts drawn once, such as `notifications`. */
    readonly parts: IRuntimeParts<IFormPartMap>;
    readonly modules: IServiceLocator<IFormModuleMap>;
    /** The form's tabs. */
    readonly tabs: IFormTabs;
    /** The form's sections. */
    readonly sections: IFormSections;
    /** The form's controls. */
    readonly controls: IFormControls;
    /** @throws Before `onLoad` has resolved. */
    getRecord(): IRecord;
    getField(fieldName: string): IField;
    getFields(): IField[];
    /** The values held, including ones that are not valid yet. */
    getData(): { [key: string]: unknown };
    isDirty(): boolean;
    isValid(): boolean;
    /** Whether a save has been attempted, after which validation is shown. */
    isSaveAttempted(): boolean;
    getValidationSummary(): IFormValidation[];
    save(): Promise<void>;
    /** Mounts the form anew; `onLoad` runs again. */
    reload(): void;
    /** Runs `blocker` before every save from now on; returns what takes it off again. */
    addSaveBlocker(blocker: FormSaveBlocker): () => void;
    /** `null` takes the form's own required level off again. */
    setFieldRequiredLevel(fieldName: string, requiredLevel: RequiredLevelEnum | null): void;
    /** `null` takes the form's own validation off again. */
    setFieldValidation(fieldName: string, validation: IFieldValidationResult | null): void;
    /** The form's own required level for the field when set, otherwise the record's. */
    getFieldRequiredLevel(fieldName: string): RequiredLevelEnum;
    /** The form's own validation for the field first, then the record's. */
    getFieldValidation(fieldName: string): IFieldValidationResult;
}

