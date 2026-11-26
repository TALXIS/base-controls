import { createElement } from 'react';
import ReactDOM from 'react-dom';
import type { DeepPartial, IRawRecord } from '@talxis/client-libraries';
import type { IDatasetControl, IDatasetControlViewControl, IDatasetControlViewGroup } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import { IStateStore, StateStore } from '@core';
import { getDefinedLabelKeys, Labels } from '@labels';
import { createThemeBuilder } from '@theme';
import type { PcfDatasetControlFrameHost } from './PcfDatasetControlFrame';
import { PcfDatasetControlTranslations } from './PcfDatasetControlTranslations';
import { getPcfDatasetControlEntryStyles } from './styles';

type StringProperty = ComponentFramework.PropertyTypes.StringProperty;
type TwoOptionsProperty = ComponentFramework.PropertyTypes.TwoOptionsProperty;

export type PcfDatasetControlProviderKind = 'Memory' | 'FetchXml';

export interface IPcfDatasetControlEntryInputs {
    DataProvider: ComponentFramework.PropertyTypes.EnumProperty<PcfDatasetControlProviderKind>;
    /** JSON `IPcfDatasetControlView[]`. */
    Views?: StringProperty;
    /** JSON entity metadata, set on the provider. */
    EntityMetadata?: StringProperty;
    /** JSON `PcfDatasetControlTranslationDictionary`, which `{{t 'key'}}` in the bindings is looked up in. */
    Translations?: StringProperty;
    Height?: StringProperty;
    ClientApiWebResourceName?: StringProperty;
    /** Called with `IPcfDatasetControlScriptParameters` on every mount, before the data loads. */
    ClientApiFunctionName?: StringProperty;
    EnableViewSwitcher?: TwoOptionsProperty;
    EnableQuickFind?: TwoOptionsProperty;
    EnableCommandBar?: TwoOptionsProperty;
    EnableEditColumns?: TwoOptionsProperty;
    EnablePagination?: TwoOptionsProperty;
    EnablePageSizeSwitcher?: TwoOptionsProperty;
}

export interface IPcfDatasetControlView<TData = unknown> {
    id: string;
    name: string;
    group?: IDatasetControlViewGroup;
    /** A fetchXml for the FetchXml provider, records for the Memory provider. */
    dataSource: string | IRawRecord[];
    /** Laid by name over the layout's or the fetchXml's columns; the rest are appended. */
    columns?: IDatasetControlViewColumn[];
    /** What the PCF's body reads through `getView().data`. */
    data?: TData;
    /** What the PCF's body reads through `getView().control`. */
    control?: IDatasetControlViewControl;
}

export interface IPcfDatasetControlConfig<TData = unknown> {
    views?: IPcfDatasetControlView<TData>[];
    metadata?: DeepPartial<Xrm.Metadata.EntityMetadata>;
}

/** What the client API function is called with. */
export interface IPcfDatasetControlScriptParameters<TData = unknown> {
    /** The runtime being mounted; it has no provider or view until it is ready. */
    datasetControl: IDatasetControl<TData>;
    controlId?: string;
    /** The bindings on the first mount, the config last set on later ones. */
    config: IPcfDatasetControlConfig<TData>;
    /** The control waits until this is called, on every mount. */
    setConfig: (config: IPcfDatasetControlConfig<TData>) => void;
}

export interface IPcfDatasetControlParts {
    enableViewSwitcher: boolean;
    enableQuickFind: boolean;
    enableCommandBar: boolean;
    enableEditColumns: boolean;
    enablePagination: boolean;
    enablePageSizeSwitcher: boolean;
}

export interface IPcfDatasetControlEntryParameters<TData = unknown> {
    /** Made by `createPcfDatasetControlFrame` at module level. */
    frame: PcfDatasetControlFrameHost<TData>;
}

/** Renders a dataset control in an isolated frame from a PCF's `init`/`updateView`. */
export class PcfDatasetControlEntry<IInputs extends IPcfDatasetControlEntryInputs, TData = unknown> {
    private _parameters: IPcfDatasetControlEntryParameters<TData>;
    private _context!: ComponentFramework.Context<IInputs>;
    private _container!: HTMLDivElement;
    private _state: ComponentFramework.Dictionary = {};
    private _stateStore!: IStateStore;
    private _config?: IPcfDatasetControlConfig<TData>;
    private _labels?: Labels;
    private _styles = getPcfDatasetControlEntryStyles();

    constructor(parameters: IPcfDatasetControlEntryParameters<TData>) {
        this._parameters = parameters;
    }

    /** @param state The PCF's `init` state; the control keeps its state in it for the session. */
    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement, state?: ComponentFramework.Dictionary): void {
        this._context = context;
        this._container = container;
        this._state = state ?? {};
        this._stateStore = new StateStore({ state: this._state });
        this._container.classList.add(this._styles.container);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        const height = this._getHeight();
        ReactDOM.render(createElement(this._parameters.frame, {
            context: this._context,
            theme: createThemeBuilder().getTheme(),
            height,
            providerKind: this._context.parameters.DataProvider.raw ?? 'Memory',
            parts: this._getParts(),
            onLoadConfig: this._loadConfig,
            labels: this._getLabels(),
            stateStore: this._stateStore,
            isUnsavedRecord: this._isUnsavedRecord(),
            frame: { height, title: 'Dataset control', className: height === '100%' ? this._styles.frame : undefined },
        }), this._container);
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
        //Power Apps hands it back to init when the control is shown again in this session
        this._context.mode.setControlState(this._state);
    }

    private _loadConfig = async (datasetControl: IDatasetControl<TData>): Promise<IPcfDatasetControlConfig<TData>> => {
        const config = this._config ?? this._getBindingConfig();
        const functionName = this._context.parameters.ClientApiFunctionName?.raw;
        //kept untranslated, so a script sees the markers on every mount
        this._config = functionName ? await this._runConfigScript(functionName, datasetControl, config) : config;
        return this._getTranslations().translateConfig(this._config);
    };

    private async _runConfigScript(functionName: string, datasetControl: IDatasetControl<TData>, config: IPcfDatasetControlConfig<TData>): Promise<IPcfDatasetControlConfig<TData>> {
        let onConfigSet!: (config: IPcfDatasetControlConfig<TData>) => void;
        const configSet = new Promise<IPcfDatasetControlConfig<TData>>(resolve => onConfigSet = resolve);
        const parameters: IPcfDatasetControlScriptParameters<TData> = {
            datasetControl,
            //@ts-ignore - typings
            controlId: this._context.utils._customControlProperties?.controlId,
            config,
            setConfig: newConfig => onConfigSet(newConfig),
        };
        //@ts-ignore - typings
        await Xrm.Utility.executeFunction(this._getWebResourceName(), functionName, [parameters]);
        return await configSet;
    }

    private _getBindingConfig(): IPcfDatasetControlConfig<TData> {
        const { Views, EntityMetadata } = this._context.parameters;
        return {
            views: Views?.raw ? JSON.parse(Views.raw) : [],
            metadata: EntityMetadata?.raw ? JSON.parse(EntityMetadata.raw) : undefined,
        };
    }

    private _getTranslations(): PcfDatasetControlTranslations {
        const { Translations } = this._context.parameters;
        return new PcfDatasetControlTranslations({
            dictionary: Translations?.raw ? JSON.parse(Translations.raw) : {},
            languageId: this._context.userSettings.languageId,
        });
    }

    //Power Apps picks the resx of the user's language; a key it lacks keeps its English default
    private _getLabels(): Labels {
        if (!this._labels) {
            const entries = getDefinedLabelKeys().map(key => [key, this._context.resources.getString(key)] as const);
            this._labels = Object.fromEntries(entries.filter(([key, value]) => value && value !== key));
        }
        return this._labels;
    }

    //on a record form the table is known, and the id only once the record is first saved
    private _isUnsavedRecord(): boolean {
        const contextInfo = (this._context.mode as ComponentFramework.Mode & { contextInfo?: { entityTypeName?: string; entityId?: string } }).contextInfo;
        return !!contextInfo?.entityTypeName && !contextInfo.entityId;
    }

    private _getParts(): IPcfDatasetControlParts {
        const { parameters } = this._context;
        const isEnabled = (property?: TwoOptionsProperty) => property?.raw ?? true;
        return {
            enableViewSwitcher: isEnabled(parameters.EnableViewSwitcher),
            enableQuickFind: isEnabled(parameters.EnableQuickFind),
            enableCommandBar: isEnabled(parameters.EnableCommandBar),
            enableEditColumns: isEnabled(parameters.EnableEditColumns),
            enablePagination: isEnabled(parameters.EnablePagination),
            enablePageSizeSwitcher: isEnabled(parameters.EnablePageSizeSwitcher),
        };
    }

    private _getHeight(): string | undefined {
        return this._context.parameters.Height?.raw?.trim() || undefined;
    }

    private _getWebResourceName(): string {
        const name = this._context.parameters.ClientApiWebResourceName?.raw;
        if (!name) {
            throw new Error('The "ClientApiWebResourceName" parameter is required when "ClientApiFunctionName" is set.');
        }
        return name;
    }
}
