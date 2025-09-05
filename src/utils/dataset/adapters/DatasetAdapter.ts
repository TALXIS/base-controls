import { Client, Dataset, FetchXmlBuilder, IColumn, IDataset, Interceptors, PowerAppsDatasetProvider } from "@talxis/client-libraries";
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
    SelectableRows?: ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">;
    EnableAutoSave?: ComponentFramework.PropertyTypes.EnumProperty<"true" | "false">;
    HomePageGridClientApiRibbonButtonId?: ComponentFramework.PropertyTypes.StringProperty;
    InlineRibbonButtonIds?: ComponentFramework.PropertyTypes.StringProperty;
    Grid?: ComponentFramework.PropertyTypes.DataSet;
}


interface IOutputs {
    DatasetControl?: any;
}

interface IDatasetAdapterInterceptors {
    onBeforeInitialized: (dataset: IDataset) => void | Promise<void>;
    getDatasetParameterName: () => string;
}

export class DatasetAdapter {
    private _container!: HTMLDivElement;
    private _dataset!: IDataset;
    private _context!: ComponentFramework.Context<IInputs, IOutputs>;
    private _client = new Client();
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _interceptors: Interceptors<IDatasetAdapterInterceptors> = new Interceptors(this._getDefaultInterceptors());
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, notifyOutputChanged: () => void, container: HTMLDivElement) {
        this._container = container;
        this._context = context;
        this._notifyOutputChanged = notifyOutputChanged;
        this._dataset = this.getDataset()
        if (!this._client.isTalxisPortal()) {
            this._dataset.setColumns(this._getDatasetFromContext().columns);
            this._dataset.setDataSource(this._getCurrentFetchXml());
        }
        this._dataset.setColumns(this._getColumns());
        if (this._getHeight() === '100%') {
            this._container.classList.add(this._getFullHeightStyles())
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
    }

    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>, onRenderComponent: (parameters: IGridParameters) => void) {
        this._context = context;
        const currentSearchQuery = this._getCurrentSearchQuery();
        if (this._dataset.getSearchQuery() != currentSearchQuery) {
            this._dataset.setSearchQuery(currentSearchQuery);
            this._dataset.refresh();
        }
        return onRenderComponent({
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
                raw: false
            },
            EnableAggregation: {
                raw: context.parameters.EnableAggregation?.raw === 'true'
            },
            EnableGrouping: {
                raw: context.parameters.EnableAggregation?.raw === 'true'
            },
            Height: {
                raw: this._getHeight()
            },
            InlineRibbonButtonIds: {
                raw: 'Mscrm.HomepageGrid.talxis_field.Deactivate'
            }
        })
    }

    public getDataset(): IDataset {
        if (this._dataset) {
            return this._dataset;
        }
        if (this._client.isTalxisPortal()) {
            return this._getDatasetFromContext() as IDataset;
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
        return this._getInterceptor('getDatasetParameterName')();
    }

    private _getDatasetFromContext(): IDataset | ComponentFramework.PropertyTypes.DataSet {
        //@ts-ignore - typings
        return this._context.parameters[this._getDatasetParameterName()];
    }

    private _getDatasetDynamicData() {
        //@ts-ignore
        const result = this._context.factory._customControlProperties.dynamicData.parameters[this._getDatasetParameterName()];
        if(!result) {
            throw new Error('Could not find the dataset in parameters. Make sure the "Grid" property is bound to a dataset.');
        }
        return result;
    }

    private _getInterceptor<K extends keyof IDatasetAdapterInterceptors>(name: K): IDatasetAdapterInterceptors[K] {
        return this._interceptors.getInterceptor(name);
    }

    private _getDefaultInterceptors(): IDatasetAdapterInterceptors {
        return {
            onBeforeInitialized: (dataset: IDataset) => { },
            getDatasetParameterName: () => 'Grid'
        }
    }

    private _isAutoSaveEnabled(): boolean {
        return this._context.parameters.EnableAutoSave?.raw === 'true';
    }

    private _isCommandBarEnabled(): boolean {
        switch (true) {
            //only case where we need to show command bar is in Power Apps when editing is enabled and auto save is disabled
            case this._isEditingEnabled() && !this._client.isTalxisPortal() && !this._isAutoSaveEnabled(): {
                return true;
            }
            default: {
                return false;
            }
        }
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
                if (commands.length === 0) {
                    this._context.navigation.openErrorDialog({
                        message: `Could not find ribbon button ${homePageGridClientApiRibbonButtonId}. Client API will not be enabled.`
                    })
                }
                else {
                    await commands[0].execute();
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

    private _getCurrentFetchXml(): string {
        if (this._client.isTalxisPortal()) {
            return this._dataset.getDataSource();
        }
        return this._getNormalizedFetchXml(this._getDatasetDynamicData().cachedQueryState.fetchXml)
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

    private _getNormalizedFetchXml(fetchXmlString: string): string {
        const fetchXml = FetchXmlBuilder.fetch.fromXml(fetchXmlString)
        fetchXml.savedqueryid = "";
        fetchXml.userqueryid = "";
        return fetchXml.toXml();
    }

    private _setViewColumns(ids: string[]) {
        //@ts-ignore - typings
        this._context.factory.fireEvent('setViewColumns', ids);
    }
    private _getPowerAppsDatasetProvider() {
        return new PowerAppsDatasetProvider(this._getCurrentFetchXml(), {
            //@ts-ignore - typings
            onGetPowerAppsDataset: () => this._getDatasetFromContext(),
            generateNewDatasetParam: () => {
                const dynamicData = this._getDatasetDynamicData();
                const dataset = this._getDatasetFromContext();
                return dynamicData.generateEmptyDataSetParam();
            },
            events: {
                onColumnsChanged: (ids) => this._setViewColumns(ids)
            }
        })
    }

}