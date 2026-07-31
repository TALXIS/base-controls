import { IFieldValidationResult } from "@talxis/client-libraries";
import type { ReactNode } from "react";
import type { IFormLabels } from "./labels";
import type { IFormStrategy } from "./stragegies/interfaces";

export interface IApiField {
    getValue: () => any;
    setValue: (value: any) => void;
}

export interface IFormAfterSaveParams {
    success: boolean;
}

export interface IValidation extends IFieldValidationResult {
    fieldName?: string;
}

export interface IFormEventHandlers {
    onFieldValueChanged: (fieldName: string, newValue: any) => void;
    onValidationSummaryChanged: (validationSummary: IValidation[]) => void;
    onDirtyStateChanged: (isDirty: boolean) => void;
    onError: (error: any, message: string) => void;
    onBeforeSave: () => void;
    onAfterSave: (params: IFormAfterSaveParams) => void;
}

export interface IFormApi {
    refresh: () => void;

    /**
     * Returns the current data held by the form, including in-progress values
     * that may currently be invalid.
     */
    getData: () => { [key: string]: any };

    getField: (fieldName: string) => IApiField;
}

export interface IFormProps extends Partial<IFormEventHandlers> {
    strategy: IFormStrategy;
    children?: ReactNode;
    onFormReady?: (api: IFormApi) => void;
    labels?: Partial<IFormLabels>;
}
