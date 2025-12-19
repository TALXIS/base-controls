import { mergeStyles } from "@fluentui/react";
import { Dataset, FetchXmlDataProvider, IColumn, IDataProvider, IDataset, Interceptors, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { IDatasetControlParameters, IDatasetControlProps } from "../../../components";
import { DatasetControl, IDatasetControl } from "../../dataset-control";

interface IOutputs {
    DatasetControl?: any;
}

interface IInputs {
    Data: ComponentFramework.PropertyTypes.StringProperty | {
        raw: IRawRecord[]
    }
    EntityMetadata: ComponentFramework.PropertyTypes.StringProperty;
    DataProvider: ComponentFramework.PropertyTypes.EnumProperty<"Memory" | "FetchXml">;
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
    IsLocalHarnessDebugMode?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    ClientApiWebresourceName?: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiFunctionName?: ComponentFramework.PropertyTypes.StringProperty;
}

interface IVirtualDatasetAdapterOptions {
    /**
     * Runs a promise that is awaited when the dataset control is initialized, before loading the first data.
     */
    onInitialize?: (dataset: IDataset) => Promise<void>;
    /**
     * If provided, this function is called when the dataset is initialized and awaited before loading first data.
     */
    CustomDataProviderClass?: new (...args: any) => IDataProvider;
}


/**
 * Helper class that holds boilerplate code for handling a virtual dataset in PCF, like syncing data, columns, and metadata from parameters.
 *
 */
export class VirtualDatasetAdapter {
    private _context!: ComponentFramework.Context<IInputs, IOutputs>;
    private _dataset!: Dataset<IDataProvider>;
    private _container!: HTMLDivElement;
    private _options?: IVirtualDatasetAdapterOptions
    private _initialized: boolean = false;
    private _state: ComponentFramework.Dictionary = {};
    private _datasetControl!: IDatasetControl;

    constructor(options?: IVirtualDatasetAdapterOptions) {
        this._options = options;
    }

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, container: HTMLDivElement, state: ComponentFramework.Dictionary) {
        this._container = container;
        this._context = context;
        this._state = state ?? {};
        if (!context.parameters.Data.raw) {
            this._createDummyDatasetControl();
            return this;
        }
        const dataProvider = this._getDataProviderInstance();
        this._dataset = new Dataset(dataProvider);
        //loads parameter columns
        this._dataset.setMetadata(this._getEntityMetadata());
        this._dataset.setDataSource(context.parameters.Data.raw);
        this._datasetControl = new DatasetControl({
            state: this._state,
            //@ts-ignore - typings
            controlId: this._context.utils._customControlProperties?.controlId,
            onGetPcfContext: () => this._context,
            onGetParameters: () => this._getDatasetControlParameters()
        });
        this._datasetControl.setInterceptor('onInitialize', async (parameters, defaultAction) => {
            //preloads dataset
            await defaultAction(parameters);
            //sets columns after preload
            this._dataset.setColumns(this._getColumns());
            await this._options?.onInitialize?.(this.getDataset());
        });
        if (this._context.parameters.Height?.raw === '100%') {
            this._container.classList.add(this._getFullTabStyles());
        }
        this._initialized = true;
    }

    /**
     * @param {?() => void} [onRenderEmptyData] - Only called when the data parameter is set to `null`. This should usually not happen since it's a required parameter, but Power Apps can pass null in certain scenarios (for example on a form with new record).
     */
    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>, onRenderComponent: (datasetControlProps: Omit<IDatasetControlProps, 'onGetControlComponent'>) => void, onRenderEmptyData?: () => void) {
        this._context = context;
        if (!context.parameters.Data.raw) {
            return onRenderEmptyData?.()
        }
        //if not yet initialized, initialize, can happen if we start without data
        if (!this._initialized) {
            this.init(context, this._container, this._state);
        }
        return onRenderComponent({
            onGetDatasetControlInstance: () => this._datasetControl
        });
    }

    public getDataset(): Dataset<IDataProvider> {
        return this._dataset;
    }

    public getDatasetControl(): IDatasetControl {
        return this._datasetControl;
    }

    private _isEditingEnabled(): boolean {
        return this._context.parameters.EnableEditing?.raw === 'true';
    }

    private _isAutoSaveEnabled(): boolean {
        return this._context.parameters.EnableAutoSave?.raw === 'true';
    }

    private _isCommandBarEnabled(): boolean {
        return this._context.parameters.EnableCommandBar?.raw !== 'false'
    }

    private _createDummyDatasetControl() {
        this._datasetControl = new DatasetControl({
            state: this._state,
            //@ts-ignore - typings
            controlId: this._context.utils._customControlProperties?.controlId,
            onGetPcfContext: () => this._context,
            onGetParameters: () => {
                return {
                    ...this._getDatasetControlParameters(),
                    Grid: new Dataset(new MemoryDataProvider([], { PrimaryIdAttribute: 'id' }))
                }
            }
        });
    }

    private _getDatasetControlParameters(): IDatasetControlParameters {
        return {
            Grid: this.getDataset(),
            EnableEditing: {
                raw: this._isEditingEnabled()
            },
            EnableCommandBar: {
                raw: this._isCommandBarEnabled()
            },
            EnableAutoSave: {
                raw: this._isAutoSaveEnabled()
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
                raw: this._context.parameters.EnableQuickFind?.raw === 'true'
            },
            EnableAggregation: {
                raw: this._context.parameters.EnableAggregation?.raw === 'true',
            },
            EnableGrouping: {
                raw: this._context.parameters.EnableGrouping?.raw === 'true'
            },
            Height: {
                raw: this._context.parameters.Height?.raw ?? null
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
                raw: this._context.parameters.EnableGroupedColumnsPinning?.raw !== 'false'
            },
            EnablePageSizeSwitcher: {
                raw: this._context.parameters.EnablePageSizeSwitcher?.raw !== 'false'
            },
            GroupingType: {
                raw: this._context.parameters.GroupingType?.raw ?? 'nested'
            },
            IsLocalHarnessDebugMode: this._context.parameters.IsLocalHarnessDebugMode,
            ClientApiWebresourceName: {
                raw: this._context.parameters.ClientApiWebresourceName?.raw ?? null
            },
            ClientApiFunctionName: {
                raw: this._context.parameters.ClientApiFunctionName?.raw ?? null
            }
        }
    }

    private _getDataProviderInstance(): IDataProvider {
        if (this._options?.CustomDataProviderClass) {
            return new this._options.CustomDataProviderClass(this._context.parameters.Data.raw);
        }
        switch (this._context.parameters.DataProvider.raw) {
            case "FetchXml": {
                return new FetchXmlDataProvider(this._context.parameters.Data.raw as string)
            }
            case 'Memory': {
                return new MemoryDataProvider(this._context.parameters.Data.raw!, this._getEntityMetadata())
            }
        }
    }

    private _getColumns() {
        try {
            const parameterColumns = this._context.parameters.Columns?.raw;
            const columns: IColumn[] = Array.isArray(parameterColumns) ? parameterColumns : JSON.parse(parameterColumns ?? "[]");
            return this._getMergedColumns(columns);
        }
        catch (err) {
            console.error(err);
            return this._dataset.columns;
        }
    }

    private _getMergedColumns(parameterColumns: IColumn[]): IColumn[] {
        const columnsMap = new Map<string, IColumn>(this._dataset.columns.map((col: IColumn) => [col.name, col]));
        const stateColumnsMap = new Map<string, IColumn>(this._state?.DatasetControlState?.columns?.map((col: IColumn) => [col.name, col]) ?? []);
        //if we have state, return it
        if (stateColumnsMap.size > 0) {
            return [...stateColumnsMap.values()];
        }
        //no state, save to load from parameters
        else {
            parameterColumns.forEach(parameterCol => {
                const col = columnsMap.get(parameterCol.name);
                if (col) {
                    columnsMap.set(col.name, {
                        ...col,
                        ...parameterCol
                    });
                } else {
                    columnsMap.set(parameterCol.name, parameterCol);
                }
            });
        }
        return [...columnsMap.values()];
    }

    private _getEntityMetadata() {
        const parameterMetadata = this._context.parameters.EntityMetadata.raw;
        if (parameterMetadata) {
            return JSON.parse(parameterMetadata);
        }
        return {};
    }

    private _getFullTabStyles() {
        return mergeStyles({
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
        });
    }
}