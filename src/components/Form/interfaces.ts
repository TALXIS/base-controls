import { IRecord } from "@talxis/client-libraries";
import { IEntityDefinition, IMetadataProvider } from "@talxis/client-metadata";
import { ITranslation } from "../../hooks";
import { IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { formTranslations } from "./translations";

export interface IFormParameters extends IParameters {
    /**
     * The record being edited. Analogous to Grid's `Grid: IDataset` parameter.
     */
    Form: IRecord;

    /**
     * Raw FormXml string. Parsed internally via `parseFormXml` from `@talxis/client-metadata`.
     * When provided (and no children are passed to `<Form>`) the formXml-driven render path is used.
     */
    FormXml?: IStringProperty;

    /**
     * Direct entity metadata. For dialog / unbound scenarios pass a `DynamicEntityDefinition`
     * from `@talxis/client-metadata` — same `IEntityDefinition` interface either way.
     * If absent, `FormModel` resolves it via the optional metadata provider dependency.
     */
    EntityMetadata?: IEntityDefinition;

    /**
     * Explicit caller-set flag, matching INT0015's `isDialog` parameter.
     * Reserved for dialog-specific behaviour later; no rendering effect in MVP.
     */
    IsDialog?: Omit<ITwoOptionsProperty, 'attributes'>;

    /**
     * Active language for localized labels declared in `formXml` (tab / section /
     * cell / control `<labels><label languagecode="..." />`). When omitted, the
     * model falls back to `context.userSettings.languageId`, then to 1033 (en-US).
     *
     * Note: attribute `DisplayName` already comes pre-translated from the entity
     * definition's `UserLocalizedLabel`; this parameter only affects formXml
     * `<labels>` resolution.
     */
    LanguageCode?: Omit<IWholeNumberProperty, 'attributes'>;
}

export interface IFormOutputs extends IOutputs {
    /**
     * Snapshot of current bound values keyed by datafieldname.
     */
    values?: Record<string, unknown>;
    /**
     * Whether the form has unsaved changes.
     */
    dirty?: boolean;
}

export interface IForm extends IControl<
    IFormParameters,
    IFormOutputs,
    Partial<ITranslation<typeof formTranslations>>,
    Record<string, never>
> {
    /**
     * Optional metadata provider used to resolve `IEntityDefinition` when
     * `parameters.EntityMetadata` is not supplied directly.
     */
    metadataProvider?: IMetadataProvider;

    /**
     * Children for the codeful mode. When provided, they replace the default
     * FormXml auto-layout render path, but `parameters.FormXml` may still be
     * supplied so codeful children can receive and reuse formXml-derived props.
     */
    children?: React.ReactNode;

    /**
     * Optional ref that receives the underlying `FormModel` instance after
     * mount. Lets external code (outside the React context) interact with
     * the form — useful for invoking `validateForm`, `setValidator`, etc.
     * from parent UI such as a toolbar / submit button.
     */
    formInstanceRef?: React.MutableRefObject<unknown>;
}

/**
 * Attribute configuration consumed by form cells / fields. Shape aligned with
 * INT0015's `IAttributeConfiguration` for future drop-in compatibility.
 */
export interface IAttributeConfiguration {
    /**
     * Whether the attribute is required according to the resolved `IEntityDefinition`.
     */
    requiredLevel: AttributeRequiredLevel;
    /**
     * Option-set choices (picklist / multi-select / two-options / state / status).
     */
    options?: IAttributeOption[];
    /**
     * Format hint (e.g. Email, Phone, TextArea, DateAndTime, …).
     */
    format?: string;
    /**
     * Maximum length for string attributes.
     */
    maxLength?: number;
    /**
     * Minimum value for numeric attributes (Integer / Decimal / Double / Money / BigInt).
     */
    minValue?: number;
    /**
     * Maximum value for numeric attributes (Integer / Decimal / Double / Money / BigInt).
     */
    maxValue?: number;
    /**
     * Lookup target entity logical names.
     */
    targets?: string[];
}

export type AttributeRequiredLevel = 'none' | 'recommended' | 'required';

export interface IAttributeOption {
    value: number;
    label: string;
    color?: string;
}

/**
 * Validation result for a single field. Shape mirrors `IFieldValidationResult`
 * from `@talxis/client-libraries` so the two are interchangeable.
 */
export interface IFieldValidationResult {
    error: boolean;
    errorMessage: string;
}

/**
 * Custom per-field validator. Returning `{ error: false, errorMessage: '' }`
 * (or `VALID_RESULT`) means the value passes; returning `error: true` marks
 * the field invalid and surfaces `errorMessage` next to the input.
 */
export type FieldValidator = () => IFieldValidationResult;

export const VALID_RESULT: IFieldValidationResult = Object.freeze({
    error: false,
    errorMessage: '',
});
