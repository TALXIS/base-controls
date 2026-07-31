import { IFieldValidationResult } from "@talxis/client-libraries";
import type { ReactNode } from "react";
import type { IFormLabels } from "./labels";
import type { IFormStrategy } from "./stragegies/interfaces";

/**
 * Minimal public field API exposed through {@link IFormApi}.
 */
export interface IApiField {
    /**
     * Returns the current in-memory value of the field.
     */
    getValue: () => any;

    /**
     * Updates the in-memory value of the field.
     */
    setValue: (value: any) => void;
}

/**
 * Final outcome of a save attempt.
 */
export interface IFormAfterSaveParams {
    /**
     * Indicates whether the save attempt completed successfully.
     */
    success: boolean;
}

/**
 * Validation entry surfaced by the form runtime.
 */
export interface IValidation extends IFieldValidationResult {
    /**
     * Field name associated with the validation issue when the issue is field-specific.
     */
    fieldName?: string;
}

/**
 * Public event callbacks that React consumers can subscribe to through {@link IFormProps}.
 */
export interface IFormEventHandlers {
    /**
     * Fired when a field value changes inside the form.
     */
    onFieldValueChanged: (fieldName: string, newValue: any) => void;

    /**
     * Fired when the aggregated validation summary changes.
     */
    onValidationSummaryChanged: (validationSummary: IValidation[]) => void;

    /**
     * Fired when the form transitions between clean and dirty state.
     */
    onDirtyStateChanged: (isDirty: boolean) => void;

    /**
     * Fired when the runtime catches an error during form work such as save operations.
     */
    onError: (error: any, message: string) => void;

    /**
     * Fired when a save attempt starts.
     */
    onBeforeSave: () => void;

    /**
     * Fired when a save attempt finishes with its final result.
     */
    onAfterSave: (params: IFormAfterSaveParams) => void;
}

/**
 * Imperative API exposed through `onFormReady`.
 */
export interface IFormApi {
    /**
     * Re-runs the strategy load pipeline and rebuilds the form with the latest data.
     */
    refresh: () => void;

    /**
     * Returns the current data held by the form, including in-progress values
     * that may currently be invalid.
     */
    getData: () => { [key: string]: any };

    /**
     * Returns a minimal imperative handle for a field by name.
     */
    getField: (fieldName: string) => IApiField;
}

/**
 * Props for the React-composed `Form.Root` runtime.
 */
export interface IFormProps extends Partial<IFormEventHandlers> {
    /**
     * Strategy responsible for loading and saving the form record.
     */
    strategy: IFormStrategy;

    /**
     * Form layout composed from `Form.*` components.
     */
    children?: ReactNode;

    /**
     * Fired when the form runtime is ready and the public imperative API can be used.
     */
    onFormReady?: (api: IFormApi) => void;

    /**
     * Localized label overrides for built-in Form UI.
     */
    labels?: Partial<IFormLabels>;
}
