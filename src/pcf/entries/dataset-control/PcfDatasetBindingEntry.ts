import ReactDOM from 'react-dom';
import type { IDatasetControl } from '@controls/dataset-control';
import { StateStore } from '@core';
import { Labels } from '@labels';
import {
    getBindingConfig, getLabels, IPcfBindingEntryInputs, IPcfDatasetControlConfig, IPcfDatasetControlView, isPartEnabled, prepareContainer, renderFrame,
    runConfigScript, translateConfig,
} from './PcfBindingEntryShared';
import type { IPcfDatasetBindingFrameProps, PcfDatasetBindingFrameHost } from './PcfDatasetBindingFrame';
import { IPowerAppsDatasetInputs, PowerAppsDatasetBridge } from './PowerAppsDatasetBridge';

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
    //what was kept may belong to another host view, column set or filter
    private _stateStore = new StateStore();
    private _config?: IPcfDatasetControlConfig<TData>;
    private _labels?: Labels;

    constructor(parameters: IPcfDatasetBindingEntryParameters<TData>) {
        this._parameters = parameters;
    }

    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;
        this._bridge = new PowerAppsDatasetBridge({ context });
        prepareContainer(container);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this._context = context;
        this._bridge.updateView(context);
        this._labels ??= getLabels(context);
        renderFrame<IPcfDatasetBindingFrameProps<TData>>(this._container, this._parameters.frame, context, {
            enablePagination: isPartEnabled(context.parameters.EnablePagination),
            enablePageSizeSwitcher: isPartEnabled(context.parameters.EnablePageSizeSwitcher),
            onLoadConfig: this._loadConfig,
            labels: this._labels,
            stateStore: this._stateStore,
            isUnsavedRecord: this._isUnsavedRecord(),
            onProviderCreated: provider => this._bridge.attach(provider),
        });
    }

    public destroy(): void {
        ReactDOM.unmountComponentAtNode(this._container);
        this._bridge.destroy();
    }

    private _loadConfig = async (datasetControl: IDatasetControl<TData>): Promise<IPcfDatasetControlConfig<TData>> => {
        //kept untranslated, so a script sees the markers on every mount
        this._config = await runConfigScript(this._context, datasetControl, this._config ?? this._getBindingConfig());
        return translateConfig(this._context, this._withAutoSave(this._config));
    };

    //nothing draws Save, so every edit saves itself
    private _withAutoSave(config: IPcfDatasetControlConfig<TData>): IPcfDatasetControlConfig<TData> {
        return {
            ...config,
            views: config.views?.map(view => ({ ...view, control: { name: view.control?.name ?? 'grid', parameters: { ...view.control?.parameters, enableAutoSave: true } } })),
        };
    }

    //a home page names its table too, so only a record form counts
    private _isUnsavedRecord(): boolean {
        const contextInfo = (this._context.mode as ComponentFramework.Mode & { contextInfo?: { entityId?: string } }).contextInfo;
        return Xrm.Utility.getPageContext().input.pageType === 'entityrecord' && !contextInfo?.entityId;
    }

    //the binding's views override the host view with their `id`, or every one with `*`
    private _getBindingConfig(): IPcfDatasetControlConfig<TData> {
        const { views = [], metadata } = getBindingConfig<TData>(this._context);
        return { views: [this._getHostView(views)], metadata };
    }

    //the binding redefines the host's columns and never adds one
    private _getHostView(views: IPcfDatasetControlView<TData>[]): IPcfDatasetControlView<TData> {
        const query = this._bridge.getQuery();
        const override = views.find(view => view.id === query.viewId) ?? views.find(view => view.id === '*');
        const columnOverrides = new Map((override?.columns ?? []).map(column => [column.name, column]));
        return {
            ...override,
            id: query.viewId,
            name: query.title,
            dataSource: query.fetchXml,
            columns: query.columns.map(column => ({ ...column, ...columnOverrides.get(column.name) })),
        };
    }
}
