import ReactDOM from 'react-dom';
import type { IDatasetControl } from '@controls/dataset-control';
import { IStateStore, StateStore } from '@core';
import { Labels } from '@labels';
import {
    getBindingConfig, getLabels, IPcfBindingEntryInputs, IPcfBindingConfig, IPcfBindingView, isPartEnabled, prepareContainer, renderFrame,
    runConfigScript, translateConfig,
} from '../shared/PcfBindingEntry';
import type { IPcfDatasetBindingFrameProps, PcfDatasetBindingFrameHost } from './PcfDatasetBindingFrame';
import { IPowerAppsDatasetInputs, PowerAppsDatasetBridge } from './power-apps/PowerAppsDatasetBridge';

export interface IPcfDatasetBindingEntryInputs extends IPcfBindingEntryInputs, IPowerAppsDatasetInputs { }

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
    private _config?: IPcfBindingConfig<TData>;
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

    private _loadConfig = async (datasetControl: IDatasetControl<TData>): Promise<IPcfBindingConfig<TData>> => {
        //kept untranslated, so a script sees the markers on every mount
        this._config = await runConfigScript(this._context, datasetControl, this._config ?? this._getBindingConfig());
        return translateConfig(this._context, this._config);
    };

    //a home page names its table too, so only a record form counts
    private _isUnsavedRecord(): boolean {
        const contextInfo = (this._context.mode as ComponentFramework.Mode & { contextInfo?: { entityId?: string } }).contextInfo;
        return Xrm.Utility.getPageContext().input.pageType === 'entityrecord' && !contextInfo?.entityId;
    }

    //the binding's views override the host view with their `id`, or every one with `*`
    private _getBindingConfig(): IPcfBindingConfig<TData> {
        const { views = [], metadata } = getBindingConfig<TData>(this._context);
        return { views: [this._getHostView(views)], metadata };
    }

    //the binding redefines the host's columns by name and appends the ones the host does not show
    private _getHostView(views: IPcfBindingView<TData>[]): IPcfBindingView<TData> {
        const query = this._bridge.getQuery();
        const override = views.find(view => view.id === query.viewId) ?? views.find(view => view.id === '*');
        const columnOverrides = new Map((override?.columns ?? []).map(column => [column.name, column]));
        const hostColumnNames = new Set(query.columns.map(column => column.name));
        return {
            ...override,
            id: query.viewId,
            name: query.title,
            dataSource: query.fetchXml,
            columns: [
                ...query.columns.map(column => ({ ...column, ...columnOverrides.get(column.name) })),
                ...(override?.columns ?? []).filter(column => !hostColumnNames.has(column.name)),
            ],
        };
    }
}
