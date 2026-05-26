import { IRecord } from "@talxis/client-libraries";
import {
    AttributeTypeEnum,
    FormXml,
    FormXmlLabels,
    FormXmlTab,
    IEntityDefinition,
    IMetadataProvider,
    Option,
    OptionSetDefinition,
    RequiredLevelEnum,
    parseFormXml,
    serializeFormXml,
} from "@talxis/client-metadata";
import { ITheme } from "@talxis/react-components";
import { getTheme } from "@fluentui/react";
import { ITranslation } from "../../../hooks";
import { formTranslations } from "../translations";
import { IForm, IFormOutputs, IFormParameters, IAttributeConfiguration, AttributeRequiredLevel, IAttributeOption, IFieldValidationResult, FieldValidator, VALID_RESULT } from "../interfaces";
import { XrmFormContext } from "./xrm/XrmFormContext";
import { XrmExecutionContext } from "./xrm/XrmExecutionContext";

interface IFormDependencies {
    labels: Required<ITranslation<typeof formTranslations>>;
    onGetProps: () => IForm;
    theme?: ITheme;
    metadataProvider?: IMetadataProvider;
    scriptLoader?: IScriptLoader;
}

/**
 * Reserved seam for future loading of `formLibraries` / web-resource scripts.
 * The default implementation in `FormModel` is a no-op.
 */
export interface IScriptLoader {
    load(libraryName: string): Promise<void>;
}

const NOOP_SCRIPT_LOADER: IScriptLoader = {
    load: async () => { /* no-op MVP stub */ },
};

export interface IRegisteredField {
    name: string;
}

export class FormModel {
    private _getProps: () => IForm;
    private _labels: Required<ITranslation<typeof formTranslations>>;
    private _theme: ITheme;
    private _metadataProvider?: IMetadataProvider;
    private _scriptLoader: IScriptLoader;

    private _parsedFormXml: FormXml | undefined;
    private _parsedFromRaw: string | null | undefined;

    private _resolvedEntity: IEntityDefinition | undefined;
    private _entityResolutionPromise: Promise<IEntityDefinition | undefined> | null = null;

    private _registeredFields = new Map<string, IRegisteredField>();
    private _fieldSubscribers = new Map<string, Set<() => void>>();
    private _formDirtySubscribers = new Set<() => void>();
    private _localDirty = false;
    private _validators = new Map<string, FieldValidator>();
    private _validationResults = new Map<string, IFieldValidationResult>();
    private _validationSubscribers = new Map<string, Set<() => void>>();
    private _formValidationSubscribers = new Set<() => void>();
    private _attachedRecord: IRecord | null = null;

    // ------------------------------------------------------------------
    // UI state (Xrm visibility / disabled / label overrides)
    // ------------------------------------------------------------------
    private _tabVisibilityOverrides = new Map<string, boolean>();
    private _sectionVisibilityOverrides = new Map<string, boolean>();
    private _controlVisibilityOverrides = new Map<string, boolean>();
    private _controlDisabledOverrides = new Map<string, boolean>();
    private _controlLabelOverrides = new Map<string, string>();
    private _requiredLevelOverrides = new Map<string, Xrm.Attributes.RequirementLevel>();
    private _uiStateSubscribers = new Set<() => void>();

    // Lazily-created Xrm surface
    private _formContext: Xrm.FormContext | null = null;
    private _executionContext: Xrm.Events.EventContext | null = null;

    private _onFieldValueChanged = (columnName: string, _newValue: any) => {
        this._localDirty = true;
        this._notifyFormDirtySubscribers();
        this._emitOutputs();
        this._notifyFieldSubscribers(columnName);
        if (this._validationResults.has(columnName) || this._validators.has(columnName)) {
            this.validateField(columnName);
        }
    };

    constructor({ onGetProps, labels, theme, metadataProvider, scriptLoader }: IFormDependencies) {
        this._getProps = onGetProps;
        this._labels = labels;
        this._theme = theme ?? getTheme();
        this._metadataProvider = metadataProvider;
        this._scriptLoader = scriptLoader ?? NOOP_SCRIPT_LOADER;
        this._attachRecordListeners();
    }

    public getProps(): IForm {
        return this._getProps();
    }

    public getRecord(): IRecord {
        return this._getProps().parameters.Form;
    }

    public getTheme(): ITheme {
        return this._theme;
    }

    public getLabels(): Required<ITranslation<typeof formTranslations>> {
        return this._labels;
    }

    public getFormXml(): FormXml | undefined {
        const raw = this._getProps().parameters.FormXml?.raw;
        if (raw == null || raw === "") {
            this._parsedFormXml = undefined;
            this._parsedFromRaw = raw;
            return undefined;
        }
        if (raw !== this._parsedFromRaw) {
            this._parsedFormXml = parseFormXml(raw);
            this._parsedFromRaw = raw;
        }
        return this._parsedFormXml;
    }

    public getActiveTab(): FormXmlTab | undefined {
        const formXml = this.getFormXml();
        return formXml?.tabs?.tab?.[0];
    }

    public getEntityDefinition(): IEntityDefinition | undefined {
        const fromParams = this._getProps().parameters.EntityMetadata;
        if (fromParams) {
            return fromParams;
        }
        if (this._resolvedEntity) {
            return this._resolvedEntity;
        }
        this._kickOffMetadataProviderResolution();
        return undefined;
    }

    public isDialog(): boolean {
        return this._getProps().parameters.IsDialog?.raw === true;
    }

    /**
     * Resolves the active language LCID for formXml `<labels>` lookup, in order:
     * 1. `parameters.LanguageCode.raw`
     * 2. `context.userSettings.languageId`
     * 3. 1033 (en-US)
     */
    public getLanguageCode(): number {
        const explicit = this._getProps().parameters.LanguageCode?.raw;
        if (typeof explicit === 'number' && !Number.isNaN(explicit) && explicit > 0) {
            return explicit;
        }
        const fromContext = (this._getProps().context as any)?.userSettings?.languageId;
        if (typeof fromContext === 'number' && !Number.isNaN(fromContext) && fromContext > 0) {
            return fromContext;
        }
        return 1033;
    }

    /**
     * Pick a label from a formXml `<labels>` node, matching the active LCID.
     * Falls back to the first available label, then to the provided fallback.
     */
    public resolveLocalizedLabel(labels: FormXmlLabels | undefined, fallback: string): string {
        const entries = labels?.label;
        if (!entries || entries.length === 0) {
            return fallback;
        }
        const lcid = this.getLanguageCode();
        const exact = entries.find((l) => l.languagecode === lcid);
        if (exact?.description) {
            return exact.description;
        }
        const anyWithText = entries.find((l) => !!l.description);
        return anyWithText?.description ?? fallback;
    }

    public getFieldLabel(datafieldname: string, control?: { labels?: FormXmlLabels }): string {
        if (control?.labels) {
            const fromXml = this.resolveLocalizedLabel(control.labels, '');
            if (fromXml) {
                return fromXml;
            }
        }
        const entity = this.getEntityDefinition();
        const attr = entity?.Attributes?.find((a) => a.LogicalName === datafieldname);
        return attr?.DisplayName || datafieldname;
    }

    public getValue(datafieldname: string): unknown {
        const record = this.getRecord();
        if (!record) {
            return undefined;
        }
        try {
            return record.getValue(datafieldname);
        } catch {
            return undefined;
        }
    }

    public setValue(datafieldname: string, value: unknown): void {
        const record = this.getRecord();
        if (!record) {
            return;
        }
        record.setValue(datafieldname, value);
        this._localDirty = true;
        this._notifyFormDirtySubscribers();
        this._emitOutputs();
        this._notifyFieldSubscribers(datafieldname);
        if (this._validationResults.has(datafieldname) || this._validators.has(datafieldname)) {
            this.validateField(datafieldname);
        }
    }

    /**
     * Subscribe to value changes for a single attribute. The callback is invoked
     * synchronously after the underlying record emits `onFieldValueChanged` for
     * that column (or after a direct `setValue` on the model). Returns an
     * unsubscribe function.
     */
    public subscribeFieldValue(name: string, cb: () => void): () => void {
        let set = this._fieldSubscribers.get(name);
        if (!set) {
            set = new Set();
            this._fieldSubscribers.set(name, set);
        }
        set.add(cb);
        return () => {
            const s = this._fieldSubscribers.get(name);
            if (!s) return;
            s.delete(cb);
            if (s.size === 0) {
                this._fieldSubscribers.delete(name);
            }
        };
    }

    private _notifyFieldSubscribers(name: string): void {
        const set = this._fieldSubscribers.get(name);
        if (!set) return;
        set.forEach((cb) => {
            try { cb(); } catch { /* swallow subscriber errors */ }
        });
    }

    public register(field: IRegisteredField): void {
        this._registeredFields.set(field.name, field);
    }

    public unregister(name: string): void {
        this._registeredFields.delete(name);
    }

    public getRegisteredFields(): IRegisteredField[] {
        return Array.from(this._registeredFields.values());
    }

    public getAttributeConfiguration(name: string): IAttributeConfiguration {
        const entity = this.getEntityDefinition();
        if (!entity) {
            throw new Error(
                `[Form] Cannot resolve attribute configuration for "${name}" — no IEntityDefinition is available. ` +
                `Provide parameters.EntityMetadata or wire a metadata provider on the Form props ` +
                `(use DynamicEntityDefinition / DynamicAttributesMetadataProvider for dialog / unbound scenarios).`
            );
        }
        const attr = entity.Attributes?.find((a) => a.LogicalName === name);
        if (!attr) {
            return {
                requiredLevel: 'none',
            };
        }
        return {
            requiredLevel: mapRequiredLevel(attr.RequiredLevel),
            options: mapOptions(attr.OptionSet),
            format: attr.Format,
            maxLength: attr.MaxLength,
            minValue: attr.MinValue,
            maxValue: attr.MaxValue,
            targets: attr.Targets,
        };
    }

    // ------------------------------------------------------------------
    // Validation
    // ------------------------------------------------------------------

    /**
     * Register a custom validator for a single column. The validator runs after
     * built-in required-level / max-length checks during `validateField`.
     *
     * When the wrapped `IRecord` exposes `expressions.setValidationExpression`
     * (the real `@talxis/client-libraries` runtime), the validator is also
     * forwarded so downstream consumers reading `record.getField(name).isValid()`
     * stay in sync.
     */
    public setValidator(name: string, validator: FieldValidator): void {
        this._validators.set(name, validator);
        const record = this.getRecord() as any;
        const setExpr = record?.expressions?.setValidationExpression;
        if (typeof setExpr === 'function') {
            try { setExpr.call(record.expressions, name, validator); } catch { /* ignore */ }
        }
    }

    public clearValidator(name: string): void {
        this._validators.delete(name);
    }

    public getValidator(name: string): FieldValidator | undefined {
        return this._validators.get(name);
    }

    /**
     * Runs all validation rules for the column and caches the result:
     *   1. Required-level (`required` and value is empty → error).
     *   2. Max-length for string attributes.
     *   3. Custom validator registered via `setValidator`.
     *   4. As a final fallback, defer to `record.getField(name).isValid()` if
     *      the record exposes that surface (real `IRecord`).
     *
     * Subscribers attached via `subscribeFieldValidation` are notified.
     */
    public validateField(name: string): IFieldValidationResult {
        const result = this._computeFieldValidation(name);
        const prev = this._validationResults.get(name);
        this._validationResults.set(name, result);
        if (!prev || prev.error !== result.error || prev.errorMessage !== result.errorMessage) {
            this._notifyValidationSubscribers(name);
            this._notifyFormValidationSubscribers();
        }
        return result;
    }

    /**
     * Returns the cached validation result for a column, or `VALID_RESULT` if
     * the column has not been validated yet.
     */
    public getFieldError(name: string): IFieldValidationResult {
        return this._validationResults.get(name) ?? VALID_RESULT;
    }

    /**
     * Validates every known column (formXml cells + registered codeful fields
     * + columns with a registered custom validator). Returns the overall
     * validity of the form.
     */
    public validateForm(): boolean {
        const names = this._collectKnownFieldNames();
        let allValid = true;
        for (const name of names) {
            const r = this.validateField(name);
            if (r.error) allValid = false;
        }
        return allValid;
    }

    /**
     * Whether the form is currently valid based on cached validation results.
     * Does not re-run any validators — call `validateForm` first to ensure
     * the cache reflects current state.
     */
    public isFormValid(): boolean {
        for (const r of this._validationResults.values()) {
            if (r.error) return false;
        }
        const record = this.getRecord() as any;
        if (typeof record?.isValid === 'function') {
            try { return record.isValid() !== false; } catch { /* ignore */ }
        }
        return true;
    }

    public subscribeFieldValidation(name: string, cb: () => void): () => void {
        let set = this._validationSubscribers.get(name);
        if (!set) {
            set = new Set();
            this._validationSubscribers.set(name, set);
        }
        set.add(cb);
        return () => {
            const s = this._validationSubscribers.get(name);
            if (!s) return;
            s.delete(cb);
            if (s.size === 0) this._validationSubscribers.delete(name);
        };
    }

    public subscribeFormValidation(cb: () => void): () => void {
        this._formValidationSubscribers.add(cb);
        return () => { this._formValidationSubscribers.delete(cb); };
    }

    private _computeFieldValidation(name: string): IFieldValidationResult {
        let cfg: IAttributeConfiguration | undefined;
        try { cfg = this.getAttributeConfiguration(name); } catch { cfg = undefined; }

        const value = this.getValue(name);

        if (cfg?.requiredLevel === 'required' && this._isEmpty(value)) {
            return {
                error: true,
                errorMessage: this._labels.requiredFieldError(),
            };
        }

        if (cfg?.maxLength != null && typeof value === 'string' && value.length > cfg.maxLength) {
            return {
                error: true,
                errorMessage: this._labels.maxLengthError({ max: cfg.maxLength }),
            };
        }

        if (typeof value === 'number' && !Number.isNaN(value)) {
            if (cfg?.minValue != null && value < cfg.minValue) {
                return {
                    error: true,
                    errorMessage: this._labels.minValueError({ min: cfg.minValue }),
                };
            }
            if (cfg?.maxValue != null && value > cfg.maxValue) {
                return {
                    error: true,
                    errorMessage: this._labels.maxValueError({ max: cfg.maxValue }),
                };
            }
        }

        const custom = this._validators.get(name);
        if (custom) {
            try {
                const r = custom();
                if (r && r.error) {
                    return { error: true, errorMessage: r.errorMessage ?? '' };
                }
            } catch (err) {
                return {
                    error: true,
                    errorMessage: err instanceof Error ? err.message : 'Validator threw.',
                };
            }
        }

        const record = this.getRecord() as any;
        if (typeof record?.getField === 'function') {
            try {
                const field = record.getField(name);
                const r = field?.isValid?.();
                if (r && r.error) {
                    return { error: true, errorMessage: r.errorMessage ?? '' };
                }
            } catch { /* swallow — record may not implement getField */ }
        }

        return VALID_RESULT;
    }

    private _isEmpty(value: unknown): boolean {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string') return value.length === 0;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }

    private _collectKnownFieldNames(): string[] {
        const names = new Set<string>();
        for (const v of this._validators.keys()) names.add(v);
        for (const f of this._registeredFields.values()) names.add(f.name);
        const tab = this.getActiveTab();
        const columns = tab?.columns?.column ?? [];
        for (const col of columns) {
            const sections = col.sections?.section ?? [];
            for (const sec of sections) {
                const rows = sec.rows?.row ?? [];
                for (const row of rows) {
                    const cells = row.cell ?? [];
                    for (const cell of cells) {
                        const dfn = cell.control?.datafieldname;
                        if (dfn) names.add(dfn);
                    }
                }
            }
        }
        return Array.from(names);
    }

    private _notifyValidationSubscribers(name: string): void {
        const set = this._validationSubscribers.get(name);
        if (!set) return;
        set.forEach((cb) => { try { cb(); } catch { /* swallow */ } });
    }

    private _notifyFormValidationSubscribers(): void {
        this._formValidationSubscribers.forEach((cb) => { try { cb(); } catch { /* swallow */ } });
    }

    // ------------------------------------------------------------------
    // Xrm surface
    // ------------------------------------------------------------------

    public getFormContext(): Xrm.FormContext {
        if (!this._formContext) {
            this._formContext = new XrmFormContext(this);
        }
        return this._formContext!;
    }

    public getExecutionContext(): Xrm.Events.EventContext {
        if (!this._executionContext) {
            this._executionContext = new XrmExecutionContext(this);
        }
        return this._executionContext!;
    }

    // ------------------------------------------------------------------
    // UI state overrides
    // ------------------------------------------------------------------

    public getTabVisible(name: string): boolean {
        const override = this._tabVisibilityOverrides.get(name);
        if (override !== undefined) return override;
        const tab = this.getFormXml()?.tabs?.tab?.find((t) => t.name === name);
        return tab?.visible !== false;
    }

    public setTabVisible(name: string, visible: boolean): void {
        this._tabVisibilityOverrides.set(name, visible);
        this._notifyUiStateSubscribers();
    }

    public getSectionVisible(tabName: string, sectionName: string): boolean {
        const key = `${tabName}:${sectionName}`;
        const override = this._sectionVisibilityOverrides.get(key);
        if (override !== undefined) return override;
        const tab = this.getFormXml()?.tabs?.tab?.find((t) => t.name === tabName);
        const section = tab?.columns?.column
            ?.flatMap((c) => c.sections?.section ?? [])
            ?.find((s) => s.name === sectionName);
        return section?.visible !== false;
    }

    public setSectionVisible(tabName: string, sectionName: string, visible: boolean): void {
        const key = `${tabName}:${sectionName}`;
        this._sectionVisibilityOverrides.set(key, visible);
        this._notifyUiStateSubscribers();
    }

    public getControlVisible(controlId: string): boolean {
        const override = this._controlVisibilityOverrides.get(controlId);
        if (override !== undefined) return override;
        const cell = this.findCellByControlId(controlId);
        return cell?.visible !== false;
    }

    public setControlVisible(controlId: string, visible: boolean): void {
        this._controlVisibilityOverrides.set(controlId, visible);
        this._notifyUiStateSubscribers();
    }

    public getControlDisabled(controlId: string): boolean {
        const override = this._controlDisabledOverrides.get(controlId);
        if (override !== undefined) return override;
        const cell = this.findCellByControlId(controlId);
        return cell?.control?.disabled === true;
    }

    public setControlDisabled(controlId: string, disabled: boolean): void {
        this._controlDisabledOverrides.set(controlId, disabled);
        this._notifyUiStateSubscribers();
    }

    public getControlLabel(controlId: string): string | undefined {
        return this._controlLabelOverrides.get(controlId);
    }

    public setControlLabel(controlId: string, label: string): void {
        this._controlLabelOverrides.set(controlId, label);
        this._notifyUiStateSubscribers();
    }

    public getRequiredLevelOverride(name: string): Xrm.Attributes.RequirementLevel | undefined {
        return this._requiredLevelOverrides.get(name);
    }

    public setRequiredLevelOverride(name: string, level: Xrm.Attributes.RequirementLevel): void {
        this._requiredLevelOverrides.set(name, level);
        this._notifyUiStateSubscribers();
    }

    public subscribeUiState(cb: () => void): () => void {
        this._uiStateSubscribers.add(cb);
        return () => { this._uiStateSubscribers.delete(cb); };
    }

    /**
     * Returns a serialized FormXml string with all current UI-state overrides
     * (tab/section/control visibility, disabled) materialized into the XML.
     * Useful for exporting the effective layout after Xrm manipulations.
     */
    public getEffectiveFormXmlString(): string {
        const xml = this.getFormXml();
        if (!xml) return '';
        const effective: FormXml = {
            ...xml,
            tabs: {
                tab: (xml.tabs?.tab ?? []).map((tab) => {
                    const tabName = tab.name ?? '';
                    return {
                        ...tab,
                        visible: this._tabVisibilityOverrides.has(tabName)
                            ? this._tabVisibilityOverrides.get(tabName)!
                            : tab.visible,
                        columns: {
                            column: (tab.columns?.column ?? []).map((col) => ({
                                ...col,
                                sections: {
                                    section: (col.sections?.section ?? []).map((sec) => {
                                        const key = `${tabName}:${sec.name ?? ''}`;
                                        return {
                                            ...sec,
                                            visible: this._sectionVisibilityOverrides.has(key)
                                                ? this._sectionVisibilityOverrides.get(key)!
                                                : sec.visible,
                                            rows: {
                                                row: (sec.rows?.row ?? []).map((row) => ({
                                                    ...row,
                                                    cell: (row.cell ?? []).map((cell) => {
                                                        const cid = cell.control?.id ?? '';
                                                        return {
                                                            ...cell,
                                                            visible: (cid && this._controlVisibilityOverrides.has(cid))
                                                                ? this._controlVisibilityOverrides.get(cid)!
                                                                : cell.visible,
                                                            control: cell.control ? {
                                                                ...cell.control,
                                                                disabled: (cid && this._controlDisabledOverrides.has(cid))
                                                                    ? this._controlDisabledOverrides.get(cid)!
                                                                    : cell.control.disabled,
                                                            } : cell.control,
                                                        };
                                                    }),
                                                })),
                                            },
                                        };
                                    }),
                                },
                            })),
                        },
                    };
                }),
            },
        };
        return serializeFormXml(effective);
    }

    private _notifyUiStateSubscribers(): void {
        this._uiStateSubscribers.forEach((cb) => { try { cb(); } catch { /* swallow */ } });
    }

    public findCellByControlId(controlId: string) {
        const formXml = this.getFormXml();
        if (!formXml) return undefined;
        for (const tab of formXml.tabs?.tab ?? []) {
            for (const col of tab.columns?.column ?? []) {
                for (const sec of col.sections?.section ?? []) {
                    for (const row of sec.rows?.row ?? []) {
                        for (const cell of row.cell ?? []) {
                            if (cell.control?.id === controlId) return cell;
                        }
                    }
                }
            }
        }
        return undefined;
    }

    /**
     * Returns parsed event metadata from formXml for inspection only.
     * No handlers are invoked.
     */
    public getEvents(): {
        formEvents: FormXml['events'];
        formLibraries: FormXml['formLibraries'];
    } {
        const formXml = this.getFormXml();
        return {
            formEvents: formXml?.events,
            formLibraries: formXml?.formLibraries,
        };
    }

    public getScriptLoader(): IScriptLoader {
        return this._scriptLoader;
    }

    // ------------------------------------------------------------------
    // Dirty tracking
    // ------------------------------------------------------------------

    /**
     * Returns whether the form has unsaved changes. Delegates to
     * `record.isDirty()` when available; falls back to a local flag
     * that is set by `setValue` / `onFieldValueChanged`.
     */
    public isDirty(): boolean {
        const record = this.getRecord() as any;
        if (typeof record?.isDirty === 'function') {
            try {
                if (record.isDirty()) return true;
            } catch { /* ignore */ }
        }
        return this._localDirty;
    }

    /**
     * Subscribe to dirty-state changes. Callback is invoked whenever
     * the form transitions between clean and dirty. Returns an unsubscribe
     * function.
     */
    public subscribeFormDirty(cb: () => void): () => void {
        this._formDirtySubscribers.add(cb);
        return () => { this._formDirtySubscribers.delete(cb); };
    }

    private _notifyFormDirtySubscribers(): void {
        this._formDirtySubscribers.forEach((cb) => { try { cb(); } catch { /* swallow */ } });
    }

    public destroy(): void {
        this._detachRecordListeners();
        this._registeredFields.clear();
        this._fieldSubscribers.clear();
        this._formDirtySubscribers.clear();
        this._validators.clear();
        this._validationResults.clear();
        this._validationSubscribers.clear();
        this._formValidationSubscribers.clear();
        this._localDirty = false;
        this._tabVisibilityOverrides.clear();
        this._sectionVisibilityOverrides.clear();
        this._controlVisibilityOverrides.clear();
        this._controlDisabledOverrides.clear();
        this._controlLabelOverrides.clear();
        this._requiredLevelOverrides.clear();
        this._uiStateSubscribers.clear();
        this._formContext = null;
        this._executionContext = null;
    }

    /**
     * Hook called by `Form.tsx` after each render so the model can react to
     * a possibly-swapped `IRecord` instance (rebind listeners).
     */
    public syncRecordBinding(): void {
        const current = this.getRecord();
        if (current !== this._attachedRecord) {
            this._detachRecordListeners();
            this._attachedRecord = current ?? null;
            this._localDirty = false;
            this._attachRecordListeners();
            // Notify subscribers and outputs that dirty state reset to clean.
            this._notifyFormDirtySubscribers();
            this._emitOutputs();
        }
    }

    private _attachRecordListeners(): void {
        const record = this.getRecord();
        if (!record) {
            return;
        }
        this._attachedRecord = record;
        const anyRecord = record as any;
        if (typeof anyRecord.addEventListener === 'function') {
            anyRecord.addEventListener('onFieldValueChanged', this._onFieldValueChanged);
        }
    }

    private _detachRecordListeners(): void {
        const record = this._attachedRecord;
        if (!record) {
            return;
        }
        const anyRecord = record as any;
        if (typeof anyRecord.removeEventListener === 'function') {
            anyRecord.removeEventListener('onFieldValueChanged', this._onFieldValueChanged);
        }
        this._attachedRecord = null;
    }

    private _emitOutputs(): void {
        const props = this._getProps();
        if (!props.onNotifyOutputChanged) {
            return;
        }
        const record = props.parameters.Form;
        const values: Record<string, unknown> = {};
        if (record) {
            const raw = record.getRawData?.();
            if (raw && typeof raw === 'object') {
                for (const key of Object.keys(raw)) {
                    values[key] = raw[key];
                }
            }
        }
        const outputs: IFormOutputs = { values, dirty: this.isDirty() };
        props.onNotifyOutputChanged(outputs);
    }

    private _kickOffMetadataProviderResolution(): void {
        if (!this._metadataProvider || this._entityResolutionPromise) {
            return;
        }
        const record = this.getRecord();
        const entityName = (record as any)?.getNamedReference?.()?.etn
            ?? (record as any)?.getRawData?.()?.['@odata.type'];
        if (!entityName || typeof entityName !== 'string') {
            return;
        }
        this._entityResolutionPromise = this._metadataProvider.entity
            .get(entityName)
            .then((def) => {
                this._resolvedEntity = def;
                return def;
            })
            .catch(() => undefined);
    }
}

function mapRequiredLevel(level: RequiredLevelEnum | undefined): AttributeRequiredLevel {
    switch (level) {
        case RequiredLevelEnum.SystemRequired:
        case RequiredLevelEnum.ApplicationRequired:
            return 'required';
        case RequiredLevelEnum.Recommended:
            return 'recommended';
        default:
            return 'none';
    }
}

function mapOptions(optionSet: OptionSetDefinition | undefined): IAttributeOption[] | undefined {
    if (!optionSet?.Options) {
        return undefined;
    }
    return optionSet.Options.map((o: Option) => ({
        value: o.Value,
        label: o.Label,
        color: o.Color,
    }));
}

// Touch AttributeTypeEnum so the import is preserved for downstream type tooling
void AttributeTypeEnum;

