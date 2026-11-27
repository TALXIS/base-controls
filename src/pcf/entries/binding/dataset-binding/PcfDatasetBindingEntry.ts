import ReactDOM from 'react-dom';
import type { IDatasetControl } from '@controls/dataset-control';
import { IStateStore, StateStore } from '@core';
import { Labels } from '@labels';
import {
    getLabels, getMetadata, getTranslations, IPcfBindingConfig, IPcfBindingEntryInputs, IPcfBindingView, isPartEnabled, prepareContainer,
    renderFrame, runConfigScript,
} from '../shared/PcfBindingEntry';
import type { IPcfDatasetBindingFrameConfig, IPcfDatasetBindingFrameProps, PcfDatasetBindingFrameHost } from './PcfDatasetBindingFrame';
import { IPowerAppsDatasetInputs, PowerAppsDatasetBridge } from './power-apps/PowerAppsDatasetBridge';

export interface IPcfDatasetBindingEntryInputs extends IPcfBindingEntryInputs, IPowerAppsDatasetInputs {
    /** JSON `IPcfDatasetBindingViewSetting`. */
    View?: ComponentFramework.PropertyTypes.StringProperty;
}

/** What the `View` binding sets on the host's view. */
export interface IPcfDatasetBindingViewSetting<TData = unknown> extends Pick<IPcfBindingView<TData>, 'columns' | 'control' | 'data'> { }

/** The host's view, with the `View` binding laid over its columns. */
export interface IPcfDatasetBindingView<TData = unknown> extends IPcfDatasetBindingViewSetting<TData> {
    /** The host's; a script cannot change it. */
    id: string;
    /** The host's; a script cannot change it. */
    name: string;
}

export interface IPcfDatasetBindingConfig<TData = unknown> {
    view: IPcfDatasetBindingView<TData>;
    metadata?: IPcfBindingConfig['metadata'];
}

export interface IPcfDatasetBindingEntryParameters<TData = unknown> {
    /** Made by `createPcfDatasetBindingFrame` at module level. */
    frame: PcfDatasetBindingFrameHost<TData>;
}

/** The entry of a PCF bound to a data-set, showing the host view its `Dataset` holds. */
export class PcfDatasetBindingEntry<IInputs extends IPcfDatasetBindingEntryInputs, TData = unknown> {
    private _parameters: IPcfDatasetBindingEntryParameters<TData>;
    private _context!: ComponentFramework.Context<IInputs>;
    private _container!: HTMLDivElement;
    private _bridge!: PowerAppsDatasetBridge;
    private _state: ComponentFramework.Dictionary = {};
    private _stateStore!: IStateStore;
    private _hostQueryKey?: string;
    private _config?: IPcfDatasetBindingConfig<TData>;
    private _labels?: Labels;

    constructor(parameters: IPcfDatasetBindingEntryParameters<TData>) {
        this._parameters = parameters;
    }

    /** @param state The PCF's `init` state; the control keeps its state in it for the session. */
    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement, state?: ComponentFramework.Dictionary): void {
        this._context = context;
        this._container = container;
        this._state = state ?? {};
        this._stateStore = new StateStore({ state: this._state });
        this._bridge = new PowerAppsDatasetBridge({ context });
        prepareContainer(container);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this._bridge.updateView(context);
        this._labels ??= getLabels(context);
        //before our own query reaches the host
        this._hostQueryKey ??= this._bridge.getQuery().key;
        renderFrame<IPcfDatasetBindingFrameProps<TData>>(this._container, this._parameters.frame, context, {
            enablePagination: isPartEnabled(context.parameters.EnablePagination),
            enablePageSizeSwitcher: isPartEnabled(context.parameters.EnablePageSizeSwitcher),
            onLoadConfig: this._loadConfig,
            labels: this._labels,
            stateStore: this._stateStore,
            hostQueryKey: this._hostQueryKey,
            isUnsavedRecord: this._isUnsavedRecord(),
            onProviderCreated: provider => this._bridge.attach(provider),
            getRecordCommands: (recordIds, commandButtonIds) => this._bridge.getRecordCommands(recordIds, commandButtonIds),
        });
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
        this._bridge.destroy();
        //Power Apps hands it back to init when the control is shown again in this session
        this._context.mode.setControlState(this._state);
    }

    private _loadConfig = async (datasetControl: IDatasetControl<TData>): Promise<IPcfDatasetBindingFrameConfig<TData>> => {
        //kept untranslated, so a script sees the markers on every mount
        this._config = await runConfigScript(this._context, datasetControl, this._config ?? this._getBindingConfig());
        const query = this._bridge.getQuery();
        const translations = getTranslations(this._context);
        return {
            view: translations.translateView({ ...this._config.view, id: query.viewId, name: query.title, dataSource: query.fetchXml }),
            metadata: translations.translateMetadata(this._config.metadata),
        };
    };

    //a home page names its table too, so only a record form counts
    private _isUnsavedRecord(): boolean {
        const contextInfo = (this._context.mode as ComponentFramework.Mode & { contextInfo?: { entityId?: string } }).contextInfo;
        return Xrm.Utility.getPageContext().input.pageType === 'entityrecord' && !contextInfo?.entityId;
    }

    private _getBindingConfig(): IPcfDatasetBindingConfig<TData> {
        const { View } = this._context.parameters;
        const setting: IPcfDatasetBindingViewSetting<TData> = View?.raw ? JSON.parse(View.raw) : {};
        return { view: this._getHostView(setting), metadata: getMetadata(this._context) };
    }

    //the setting redefines the host's columns by name and appends the ones the host does not show
    private _getHostView(setting: IPcfDatasetBindingViewSetting<TData>): IPcfDatasetBindingView<TData> {
        const query = this._bridge.getQuery();
        const columnSettings = new Map((setting.columns ?? []).map(column => [column.name, column]));
        const hostColumnNames = new Set(query.columns.map(column => column.name));
        return {
            ...setting,
            id: query.viewId,
            name: query.title,
            columns: [
                ...query.columns.map(column => ({ ...column, ...columnSettings.get(column.name) })),
                ...(setting.columns ?? []).filter(column => !hostColumnNames.has(column.name)),
            ],
        };
    }
}
