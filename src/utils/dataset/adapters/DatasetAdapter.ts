import { Client, Dataset, FetchXmlBuilder, IColumn, IDataset, PowerAppsDatasetProvider } from "@talxis/client-libraries";
import { mergeStyles } from "@fluentui/react";
import { IDatasetControlParameters, IDatasetControlProps } from "../../../components";
import { DatasetControl, IDatasetControl } from "../../dataset-control";

interface IInputs {
    Grid: ComponentFramework.PropertyTypes.DataSet;
    RibbonGroupingDataset?: ComponentFramework.PropertyTypes.DataSet;
    EnableQuickFind?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    Columns?: ComponentFramework.PropertyTypes.StringProperty;
    Height?: ComponentFramework.PropertyTypes.StringProperty;
    RowHeight?: ComponentFramework.PropertyTypes.WholeNumberProperty;
    EnableEditing?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnablePagination?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableFiltering?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableSorting?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableNavigation?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableOptionSetColors?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableAggregation?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableGrouping?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableAutoSave?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableCommandBar?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableZebra?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableGroupedColumnsPinning?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnablePageSizeSwitcher?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableRecordCount?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    HomePageGridClientApiRibbonButtonId?: ComponentFramework.PropertyTypes.StringProperty;
    InlineRibbonButtonIds?: ComponentFramework.PropertyTypes.StringProperty;
    DefaultExpandedGroupLevel?: ComponentFramework.PropertyTypes.WholeNumberProperty;
    SelectableRows?: ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">;
    GroupingType?: ComponentFramework.PropertyTypes.EnumProperty<"nested" | "flat">;
    ClientApiWebresourceName?: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiFunctionName?: ComponentFramework.PropertyTypes.StringProperty;

}

interface IDatasetAdapterOptions {
    onInitialize?: (dataset: IDataset) => Promise<void>;
}


interface IOutputs {
    DatasetControl?: any;
}

export class DatasetAdapter {
    private _container!: HTMLDivElement;
    private _dataset!: IDataset;
    private _context!: ComponentFramework.Context<IInputs, IOutputs>;
    private _client = new Client();
    private _scheduleForRefresh: boolean = false;
    private _options?: IDatasetAdapterOptions;
    private _state: ComponentFramework.Dictionary = {};
    private _datasetControl!: IDatasetControl;

    constructor(options?: IDatasetAdapterOptions) {
        this._options = options;
    }

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, container: HTMLDivElement, state: ComponentFramework.Dictionary) {
        this._container = container;
        this._context = context;
        this._state = state ?? {};
        this._flushInvalidState();
        this._dataset = this.getDataset();
        this._datasetControl = new DatasetControl({
            state: this._state,
            controlId: this._dataset.getViewId(),
            onGetPcfContext: () => this._context,
            onGetParameters: () => this._getDatasetControlParameters()
        });
        //loads parameter columns
        //@ts-ignore - typings
        this._datasetControl.setInterceptor('onInitialize', async (parameters, defaultAction) => {
            //preloads dataset
            await defaultAction(parameters);
            //sets columns after preload
            this._dataset.setColumns(this._getColumns());
            await this._options?.onInitialize?.(this.getDataset());
        });
        if (this._getHeight() === '100%') {
            this._container.classList.add(this._getFullHeightStyles())
        }
        //@ts-ignore - typings
        this._context.factory.fireEvent('onDatasetControlInstanceReady', this._datasetControl);
    }

    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>, onRenderComponent: (datasetControlProps: Omit<IDatasetControlProps, 'onGetControlComponent'>) => void) {
        this._context = context;
        if (!this._client.isTalxisPortal()) {
            this._syncPowerAppsDatasetSetup();
            this._syncPowerAppsDatasetOnNativeRefresh();
        }
        return onRenderComponent({
            onGetDatasetControlInstance: () => this._datasetControl,
        });
    }

    public getDataset(): IDataset {
        if (this._dataset) {
            return this._dataset;
        }
        let dataset: IDataset;
        if (this._client.isTalxisPortal()) {
            dataset = <IDataset>this._context.parameters.Grid;
        }
        else {
            dataset = new Dataset(this._getPowerAppsDatasetProvider())
        }
        dataset.getDataProvider().setProperty('isStandalone', false);
        return dataset;
    }

    public destroy(): void {
        if (!this._client.isTalxisPortal()) {
            const state = this._state ?? {};
            const DatasetControlState = state.DatasetControlState ?? {};
            DatasetControlState.fetchXml = this._getDatasetDynamicData().cachedQueryState.fetchXml;
            state.DatasetControlState = DatasetControlState;
            this._context.mode.setControlState(state);
        }
    }

    private _getDatasetControlParameters(): IDatasetControlParameters {
        return {
            Grid: this.getDataset(),
            EnableEditing: {
                //raw: true
                raw: this._isEditingEnabled()
            },
            EnableCommandBar: {
                //always handled by host platform
                raw: false
            },
            EnableAutoSave: {
                raw: this._isAutoSaveEnabled()
                //raw: true
            },
            EnablePagination: {
                raw: this._context.parameters.EnablePagination?.raw !== 'false'
            },
            EnableFiltering: {
                raw: this._context.parameters.EnableFiltering?.raw !== 'false'
            },
            EnableSorting: {
                raw: this._context.parameters.EnableSorting?.raw !== 'false'
            },
            EnableNavigation: {
                raw: this._context.parameters.EnableNavigation?.raw !== 'false'
            },
            EnableOptionSetColors: {
                raw: this._context.parameters.EnableOptionSetColors?.raw === 'true'
            },
            SelectableRows: {
                raw: this._context.parameters.SelectableRows?.raw ?? 'single'
            },
            RowHeight: {
                raw: this._context.parameters.RowHeight?.raw ?? 42
            },
            //quick find is always handled by platform
            EnableQuickFind: {
                raw: false
            },
            EnableAggregation: {
                //raw: true
                raw: this._context.parameters.EnableAggregation?.raw === 'true',
            },
            EnableGrouping: {
                //raw: true
                raw: this._context.parameters.EnableGrouping?.raw === 'true'
            },
            Height: {
                raw: this._getHeight()
            },
            InlineRibbonButtonIds: {
                raw: this._context.parameters.InlineRibbonButtonIds?.raw ?? null
            },
            EnableZebra: {
                raw: this._context.parameters.EnableZebra?.raw !== 'false'
            },
            DefaultExpandedGroupLevel: {
                raw: this._context.parameters.DefaultExpandedGroupLevel?.raw ?? null
            },
            EnableRecordCount: {
                raw: this._context.parameters.EnableRecordCount?.raw !== 'false'
            },
            EnableGroupedColumnsPinning: {
                //raw: false
                raw: this._context.parameters.EnableGroupedColumnsPinning?.raw !== 'false'
            },
            EnablePageSizeSwitcher: {
                raw: this._context.parameters.EnablePageSizeSwitcher?.raw !== 'false'
            },
            GroupingType: {
                raw: this._context.parameters.GroupingType?.raw ?? 'nested'
            },
            ClientApiWebresourceName: {
                raw: this._context.parameters.ClientApiWebresourceName?.raw ?? null
            },
            ClientApiFunctionName: {
                raw: this._context.parameters.ClientApiFunctionName?.raw ?? null
            }
        }
    }


    private _getDatasetDynamicData() {
        //@ts-ignore - typings
        const result = this._context.factory._customControlProperties.dynamicData.parameters.Grid;
        if (!result) {
            throw new Error('Could not find the dataset in parameters. Make sure the "Grid" property is bound to a dataset.');
        }
        return result;
    }

    private _isAutoSaveEnabled(): boolean {
        return this._context.parameters.EnableAutoSave?.raw === 'true';
    }
    private _isEditingEnabled(): boolean {
        return this._context.parameters.EnableEditing?.raw === 'true';
    }
    private _getHeight(): string | null {
        if (this._isHomePageGrid()) {
            return '100%';
        }
        return this._context.parameters.Height?.raw ?? null;
    }

    //toggle refresh on our grid when native dataset is refreshed
    private _syncPowerAppsDatasetOnNativeRefresh() {
        const provider = this.getDataset().getDataProvider() as PowerAppsDatasetProvider;
        //this makes sure that internally triggered refresh does not cause infinite loop
        if (this._context.parameters.Grid.loading && !provider.isMainDatasetSyncInProgress()) {
            this._scheduleForRefresh = true;
            return;
        }
        if (this._scheduleForRefresh) {
            this._scheduleForRefresh = false;
            provider.refreshFromOutside();
        }
    }

    private _syncPowerAppsDatasetSetup() {
        this._dataset.setSearchQuery(this._getCurrentSearchQuery());
    }

    private _flushInvalidState() {
        if (!this._client.isTalxisPortal()) {
            this._parseQueryKey(this._getDatasetDynamicData()._getQueryKey());
            const currentFetchXml = this._harmonizeFetchXml(this._getDatasetDynamicData().cachedQueryState.fetchXml);
            const stateFetchXml = this._harmonizeFetchXml(this._state?.DatasetControlState?.fetchXml);
            if (currentFetchXml !== stateFetchXml) {
                Object.keys(this._state).map(key => delete this._state[key]);
            }
        }
    }

    //Power Apps does not persist state of these properties => do not consider them for state comparison
    private _harmonizeFetchXml(fetchXml?: string) {
        if (!fetchXml) {
            return null;
        }
        const fetch = FetchXmlBuilder.fetch.fromXml(fetchXml);
        fetch.page = 1;
        fetch.count = 50;
        fetch.pagingCookie = "";
        //why does this get randomly added?
        fetch.entity.attributes = fetch.entity.attributes.filter(attr => attr.name !== 'statecode');
        return fetch.toXml();

    }

    private _parseQueryKey(queryKey?: string) {
        if (!queryKey) {
            return null;
        }
        const parts = queryKey.split(':');
        parts.pop();
        return parts.join(':');
    }

    private _getColumns() {
        try {
            const parameterColumns: IColumn[] = JSON.parse(this._context.parameters.Columns?.raw ?? '[]');
            return this._getMergedColumns(parameterColumns);
        }
        catch (err) {
            console.error(err)
            return this._dataset.columns;
        }
    }
    private _getMergedColumns(parameterColumns: IColumn[]): IColumn[] {
        const columnsMap = new Map<string, IColumn>(this._dataset.columns.map((col: IColumn) => [col.name, col]));
        const stateColumnsMap = new Map<string, IColumn>(this._state?.DatasetControlState?.columns?.map((col: IColumn) => [col.name, col]) ?? []);
        //load from state
        if (stateColumnsMap.size > 0) {
            //save to return state in portal;
            if (this._client.isTalxisPortal()) {
                return [...stateColumnsMap.values()];
            }
            else {
                this._dataset.columns.map(col => {
                    stateColumnsMap.set(col.name, {
                        ...stateColumnsMap.get(col.name),
                        isHidden: col.isHidden
                    } as IColumn)
                });
                return [...stateColumnsMap.values()];
            }
        }
        else {
            parameterColumns.map(parameterCol => {
                const col = columnsMap.get(parameterCol.name);
                if (col) {
                    columnsMap.set(col.name, {
                        ...col,
                        ...parameterCol
                    })
                }
                else {
                    columnsMap.set(parameterCol.name, parameterCol);
                }
            })
        }
        return [...columnsMap.values()]
    }

    private _getFullHeightStyles() {
        return mergeStyles({
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
        })
    }

    private _getCurrentSearchQuery(): string {
        if (this._client.isTalxisPortal()) {
            return this._dataset.getSearchQuery();
        }
        return this._getDatasetDynamicData().cachedQueryState.searchString;
    }

    private _isHomePageGrid(): boolean {
        //@ts-ignore - typings
        return this._context.utils._customControlProperties.contextString === 'grid';
    }

    private _getPowerAppsDatasetProvider() {
        return new PowerAppsDatasetProvider({
            onGetContext: () => this._context
        })
    }
}