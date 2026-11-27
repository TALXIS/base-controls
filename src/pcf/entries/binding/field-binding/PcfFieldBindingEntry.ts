import ReactDOM from 'react-dom';
import type { IDatasetControl } from '@controls/dataset-control';
import { IStateStore, StateStore } from '@core';
import { Labels } from '@labels';
import {
    getLabels, getMetadata, getTranslations, IPcfBindingEntryInputs, IPcfBindingConfig, isPartEnabled, prepareContainer, renderFrame,
    runConfigScript,
} from '../shared/PcfBindingEntry';
import type { IPcfFieldBindingFrameProps, IPcfFieldBindingParts, PcfFieldBindingFrameHost, PcfFieldBindingProviderKind } from './PcfFieldBindingFrame';

type TwoOptionsProperty = ComponentFramework.PropertyTypes.TwoOptionsProperty;

export interface IPcfFieldBindingEntryInputs extends IPcfBindingEntryInputs {
    /** JSON `IPcfBindingView[]`. */
    Views?: ComponentFramework.PropertyTypes.StringProperty;
    DataProvider: ComponentFramework.PropertyTypes.EnumProperty<PcfFieldBindingProviderKind>;
    EnableViewSwitcher?: TwoOptionsProperty;
    EnableQuickFind?: TwoOptionsProperty;
    EnableCommandBar?: TwoOptionsProperty;
    EnableEditColumns?: TwoOptionsProperty;
}

export interface IPcfFieldBindingEntryParameters<TData = unknown> {
    /** Made by `createPcfFieldBindingFrame` at module level. */
    frame: PcfFieldBindingFrameHost<TData>;
}

/** The entry of a PCF bound to a field, showing the views its `Views` binding lists. */
export class PcfFieldBindingEntry<IInputs extends IPcfFieldBindingEntryInputs, TData = unknown> {
    private _parameters: IPcfFieldBindingEntryParameters<TData>;
    private _context!: ComponentFramework.Context<IInputs>;
    private _container!: HTMLDivElement;
    private _state: ComponentFramework.Dictionary = {};
    private _stateStore!: IStateStore;
    private _config?: IPcfBindingConfig<TData>;
    private _labels?: Labels;

    constructor(parameters: IPcfFieldBindingEntryParameters<TData>) {
        this._parameters = parameters;
    }

    /** @param state The PCF's `init` state; the control keeps its state in it for the session. */
    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement, state?: ComponentFramework.Dictionary): void {
        this._context = context;
        this._container = container;
        this._state = state ?? {};
        this._stateStore = new StateStore({ state: this._state });
        prepareContainer(container);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this._labels ??= getLabels(context);
        renderFrame<IPcfFieldBindingFrameProps<TData>>(this._container, this._parameters.frame, context, {
            providerKind: context.parameters.DataProvider.raw ?? 'Memory',
            parts: this._getParts(),
            onLoadConfig: this._loadConfig,
            labels: this._labels,
            stateStore: this._stateStore,
            isUnsavedRecord: this._isUnsavedRecord(),
        });
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
        //Power Apps hands it back to init when the control is shown again in this session
        this._context.mode.setControlState(this._state);
    }

    private _loadConfig = async (datasetControl: IDatasetControl<TData>): Promise<IPcfBindingConfig<TData>> => {
        //kept untranslated, so a script sees the markers on every mount
        this._config = await runConfigScript(this._context, datasetControl, this._config ?? this._getBindingConfig());
        const translations = getTranslations(this._context);
        return {
            views: this._config.views?.map(view => translations.translateView(view)),
            metadata: translations.translateMetadata(this._config.metadata),
        };
    };

    private _getBindingConfig(): IPcfBindingConfig<TData> {
        const { Views } = this._context.parameters;
        return { views: Views?.raw ? JSON.parse(Views.raw) : [], metadata: getMetadata(this._context) };
    }

    //on a record form the table is known, and the id only once the record is first saved
    private _isUnsavedRecord(): boolean {
        const contextInfo = (this._context.mode as ComponentFramework.Mode & { contextInfo?: { entityTypeName?: string; entityId?: string } }).contextInfo;
        return !!contextInfo?.entityTypeName && !contextInfo.entityId;
    }

    private _getParts(): IPcfFieldBindingParts {
        const { parameters } = this._context;
        return {
            enableViewSwitcher: isPartEnabled(parameters.EnableViewSwitcher),
            enableQuickFind: isPartEnabled(parameters.EnableQuickFind),
            enableCommandBar: isPartEnabled(parameters.EnableCommandBar),
            enableEditColumns: isPartEnabled(parameters.EnableEditColumns),
            enablePagination: isPartEnabled(parameters.EnablePagination),
            enablePageSizeSwitcher: isPartEnabled(parameters.EnablePageSizeSwitcher),
        };
    }
}
