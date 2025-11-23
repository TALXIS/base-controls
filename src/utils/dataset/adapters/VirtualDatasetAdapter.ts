import { mergeStyles } from "@fluentui/react";
import { Dataset, FetchXmlDataProvider, IColumn, IDataProvider, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { IDatasetControl, IGridParameters } from "../../../components";

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
    SelectableRows?: ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">;
    EnableAutoSave?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    EnableCommandBar?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    HomePageGridClientApiRibbonButtonId?: ComponentFramework.PropertyTypes.StringProperty;
    InlineRibbonButtonIds?: ComponentFramework.PropertyTypes.StringProperty;
}

interface IVirtualDatasetAdapterOptions {
    /**
     * If provided, this function is called when the dataset is initialized and awaited before loading first data.
     */
    onInitialize?: () => Promise<void>;
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
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });
    private _options?: IVirtualDatasetAdapterOptions
    private _initialized: boolean = false;
    private _state: ComponentFramework.Dictionary = {};

    constructor(options?: IVirtualDatasetAdapterOptions) {
        this._options = options;
    }

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, notifyOutputChanged: () => void, container: HTMLDivElement, state: ComponentFramework.Dictionary) {
        this._container = container;
        this._context = context;
        this._state = state ?? {};
        this._notifyOutputChanged = notifyOutputChanged;
        if (!context.parameters.Data.raw) {
            return this;
        }
        const dataProvider = this._getDataProviderInstance();
        this._dataset = new Dataset(dataProvider);
        this._dataset.setDataSource(context.parameters.Data.raw);
        this._dataset.setMetadata(this._getEntityMetadata());
        if (this._context.parameters.Height?.raw === '100%') {
            this._container.classList.add(this._getFullTabStyles());
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
        this._initialized = true;
    }

    /**
     * @param {?() => void} [onRenderEmptyData] - Only called when the data parameter is set to `null`. This should usually not happen since it's a required parameter, but Power Apps can pass null in certain scenarios (for example on a form with new record).
     */
    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>, onRenderComponent: (datasetControlProps: Omit<IDatasetControl, 'onGetControlComponent'>) => void, onRenderEmptyData?: () => void) {
        this._context = context;
        if (!context.parameters.Data.raw) {
            return onRenderEmptyData?.()
        }
        //if not yet initialized, initialize, can happen if we start without data
        if (!this._initialized) {
            this.init(context, this._notifyOutputChanged, this._container, this._state);
        }
        return onRenderComponent({
            context: this._context as any,
            state: this._state,
            parameters: {
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
                    raw: context.parameters.EnablePagination?.raw !== 'false'
                },
                EnableFiltering: {
                    raw: context.parameters.EnableFiltering?.raw !== 'false'
                },
                EnableSorting: {
                    raw: context.parameters.EnableSorting?.raw !== 'false'
                },
                EnableNavigation: {
                    raw: context.parameters.EnableNavigation?.raw !== 'false'
                },
                EnableOptionSetColors: {
                    raw: context.parameters.EnableOptionSetColors?.raw === 'true'
                },
                SelectableRows: {
                    raw: context.parameters.SelectableRows?.raw ?? 'single'
                },
                RowHeight: {
                    raw: context.parameters.RowHeight?.raw ?? 42
                },
                //quick find is always handled by platform
                EnableQuickFind: {
                    raw: context.parameters.EnableQuickFind?.raw === 'true'
                },
                EnableAggregation: {
                    raw: context.parameters.EnableAggregation?.raw === 'true',
                },
                EnableGrouping: {
                    raw: context.parameters.EnableGrouping?.raw === 'true'
                },
                Height: {
                    raw: this._context.parameters.Height?.raw ?? null
                },
                InlineRibbonButtonIds: {
                    raw: context.parameters.InlineRibbonButtonIds?.raw ?? null
                },
            }
        })
    }

    public getDataset(): Dataset<IDataProvider> {
        return this._dataset;
    }

    public destroy(): void {
    }

    public getOutputs(): IOutputs {
        this._resolveGetOutputs(true);
        return {
            DatasetControl: this.getDataset()
        };
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

    private async _onDatasetInit() {
        await this._getOutputsPromise;
        await this._options?.onInitialize?.();
        this._dataset.setColumns(this._getColumns());
        this._dataset.paging.loadExactPage(this._dataset.paging.pageNumber);
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