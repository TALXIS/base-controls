import { Client, Dataset, IColumn, IDataset, Interceptors, PowerAppsDatasetProvider } from "@talxis/client-libraries";
import { mergeStyles } from "@fluentui/react";
import { IGridParameters } from "../../../components";

interface IInputs {
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
    HomePageGridClientApiRibbonButtonId?: ComponentFramework.PropertyTypes.StringProperty;
    InlineRibbonButtonIds?: ComponentFramework.PropertyTypes.StringProperty;
    [key: string]: any;
}


interface IOutputs {
    DatasetControl?: any;
}

interface IDatasetAdapterInterceptors {
    onBeforeInitialized: (dataset: IDataset) => void | Promise<void>;
}

interface IDatasetAdapterOptions {
    /**
     * Name of the dataset binging as defined in manifest.
     * @default "Grid"
     */
    datasetParameterName?: string;
    /**
     * Name of the ribbon grouping dataset as defined in manifest. If the dataset is not defined, the ribbon will not work correctly when grouping is enabled.
     * @default "RibbonGroupingDataset"
     */
    ribbonGroupingDatasetName?: string;
}

const DATASET_NAME_DEFAULT = 'Grid';
const RIBBON_GROUPING_DATASET_NAME_DEFAULT = 'RibbonGroupingDataset';

export class DatasetAdapter {
    private _container!: HTMLDivElement;
    private _dataset!: IDataset;
    private _context!: ComponentFramework.Context<IInputs, IOutputs>;
    private _client = new Client();
    private _options?: IDatasetAdapterOptions;
    private _scheduleForRefresh: boolean = false;
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _interceptors: Interceptors<IDatasetAdapterInterceptors> = new Interceptors(this._getDefaultInterceptors());
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });

    constructor(options?: IDatasetAdapterOptions) {
        this._options = options;
    }

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, notifyOutputChanged: () => void, container: HTMLDivElement) {
        this._container = container;
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._dataset = this.getDataset();
        this._dataset.setColumns(this._getColumns());
        if (this._getHeight() === '100%') {
            this._container.classList.add(this._getFullHeightStyles())
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
    }

    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>, onRenderComponent: (parameters: IGridParameters) => void) {
        this._context = context;
        if (!this._client.isTalxisPortal()) {
            this._syncPowerAppsDatasetSetup();
            this._syncPowerAppsDatasetOnNativeRefresh();
        }
        return onRenderComponent({
            Grid: this.getDataset(),
            EnableEditing: {
                raw: this._isEditingEnabled()
            },
            EnableCommandBar: {
                //always handled by host platform
                raw: false
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
                raw: false
            },
            EnableAggregation: {
                raw: context.parameters.EnableAggregation?.raw === 'true',
            },
            EnableGrouping: {
                raw: context.parameters.EnableFiltering?.raw === 'true'
            },
            Height: {
                raw: this._getHeight()
            },
            InlineRibbonButtonIds: {
                raw: context.parameters.InlineRibbonButtonIds?.raw ?? null
            },
        })
    }

    public getDataset(): IDataset {
        if (this._dataset) {
            return this._dataset;
        }
        if (this._client.isTalxisPortal()) {
            return <IDataset>this._getDatasetByName(this._getDatasetParameterName(), true);
        }
        return new Dataset(this._getPowerAppsDatasetProvider(), {
            isVirtual: false
        });
    }

    public setInterceptor<K extends keyof IDatasetAdapterInterceptors>(name: K, interceptor: IDatasetAdapterInterceptors[K]) {
        this._interceptors.setInterceptor(name, interceptor);
    }

    public getOutputs(): IOutputs {
        this._resolveGetOutputs(true);
        return {
            DatasetControl: this._dataset
        }
    }

    public destroy(): void {
        //@ts-ignore - typings
        delete window.Xrm[this._getGlobalDatasetInstanceName()];
        if (!this._client.isTalxisPortal()) {
            this._dataset.destroy();
        }
    }


    private _getDatasetParameterName(): string {
        return this._options?.datasetParameterName ?? DATASET_NAME_DEFAULT;
    }
    private _getRibbonGroupingDatasetParameterName(): string {
        return this._options?.ribbonGroupingDatasetName ?? RIBBON_GROUPING_DATASET_NAME_DEFAULT;
    }

    private _getDatasetByName(name: string, throwErrorOnNotFound?: true): ComponentFramework.PropertyTypes.DataSet | IDataset;
    private _getDatasetByName(name: string, throwErrorOnNotFound?: boolean): ComponentFramework.PropertyTypes.DataSet | IDataset | null {
        const dataset = this._context.parameters[name] ?? null;
        if (!dataset && throwErrorOnNotFound) {
            throw new Error(`Could not find the dataset parameter "${name}". Make sure the dataset is bound in the manifest.`);
        }

        return dataset;
    }

    private _getDatasetDynamicData() {
        //@ts-ignore
        const result = this._context.factory._customControlProperties.dynamicData.parameters[this._getDatasetParameterName()];
        if (!result) {
            throw new Error('Could not find the dataset in parameters. Make sure the "Grid" property is bound to a dataset.');
        }
        return result;
    }

    private _getInterceptor<K extends keyof IDatasetAdapterInterceptors>(name: K): IDatasetAdapterInterceptors[K] {
        return this._interceptors.getInterceptor(name);
    }

    private _getDefaultInterceptors(): IDatasetAdapterInterceptors {
        return {
            onBeforeInitialized: (dataset: IDataset) => { }
        }
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
        const powerAppsDataset = this._getDatasetByName(this._getDatasetParameterName(), true) as ComponentFramework.PropertyTypes.DataSet;
        const provider = this.getDataset().getDataProvider() as PowerAppsDatasetProvider;
        //this makes sure that internally triggered refresh does not cause infinite loop
        if (powerAppsDataset.loading && !provider.isMainDatasetSyncInProgress()) {
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

    private async _onDatasetInit() {
        const initializationCallback = async () => {
            await this._getOutputsPromise;
            await this._getInterceptor('onBeforeInitialized')(this.getDataset());
            const homePageGridClientApiRibbonButtonId = this._context.parameters.HomePageGridClientApiRibbonButtonId?.raw;
            if (this._isHomePageGrid() && homePageGridClientApiRibbonButtonId) {
                //@ts-ignore - typings
                window.Xrm[this._getGlobalDatasetInstanceName()] = this._dataset;
                const commands = await this.getDataset().getDataProvider().retrieveRecordCommand({
                    recordIds: [],
                    specificCommands: [homePageGridClientApiRibbonButtonId]
                });
                const command = commands.find(x => x.commandButtonId === homePageGridClientApiRibbonButtonId);
                if (!command) {
                    this._context.navigation.openErrorDialog({
                        message: `Could not find ribbon button ${homePageGridClientApiRibbonButtonId}. Client API will not be enabled.`
                    })
                }
                else {
                    await command.execute();
                }
            }
        }
        if (this._client.isTalxisPortal()) {
            this._dataset.setInterceptor('onInitialize', () => initializationCallback());
        }
        else {
            await initializationCallback();
            this._dataset.paging.loadExactPage(this._dataset.paging.pageNumber);
        }
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
        const columnsMap = new Map(this._dataset.getDataProvider().getColumns().map(col => [col.name, col]));
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

    private _getGlobalDatasetInstanceName() {
        //@ts-ignore
        return `talxis_grid_${this._context.utils._customControlProperties.id}`;
    }
    private _getPowerAppsDatasetProvider() {
        return new PowerAppsDatasetProvider({
            datasetParameterName: this._getDatasetParameterName(),
            onGetContext: () => this._context,
            onGetPowerAppsDataset: () => <ComponentFramework.PropertyTypes.DataSet>this._getDatasetByName(this._getDatasetParameterName(), true),
            onGetRibbonGroupingPowerAppsDataset: () => <ComponentFramework.PropertyTypes.DataSet>this._getDatasetByName(this._getRibbonGroupingDatasetParameterName(), true)
        })
    }

}