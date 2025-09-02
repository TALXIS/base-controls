import { Client, Dataset, FetchXmlBuilder, IColumn, IDataProvider, IDataset, PowerAppsDatasetProvider } from "@talxis/client-libraries";
import { mergeStyles } from "@fluentui/react";

interface IInputs {
    [key: string]: any
}

interface IOutputs {
    DatasetControl?: any;
}

interface IParameterGetters {
    onGetDataset: () => ComponentFramework.PropertyTypes.DataSet | IDataset;
    onGetColumns?: () => string | null
    onGetHeight?: () => string | null
    onGetHomePageGridClientApiRibbonButtonId?: () => string | null;
    onGetInlineRibbonButtonIds?: () => string | null;
    /**
     * Callback that gets triggered and awaited before the dataset is initialized. Useful for setting initialization code that needs to run before the dataset is ready.
     */
    onInitialize?: () => void | Promise<void>
}

export class DatasetAdapter {
    private _container!: HTMLDivElement;
    private _dataset!: Dataset<IDataProvider>;
    private _context!: ComponentFramework.Context<IInputs, IOutputs>;
    private _lastUsedColumns?: string | null;
    private _pendingForceRefresh: boolean = false;
    private _powerAppsDatasetProvider?: PowerAppsDatasetProvider;
    private _client = new Client();
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });
    private _initialRender: boolean = true;
    private _homePageGridClientApiRibbonButtonId?: string | null;
    private _parameters!: IParameterGetters;
    private _datasetPropertyName!: string;

    public init(context: ComponentFramework.Context<IInputs, IOutputs>, notifyOutputChanged: () => void, container: HTMLDivElement, parameters: IParameterGetters) {
        this._container = container;
        this._context = context;
        this._parameters = parameters;
        this._datasetPropertyName = this._getDatasetPropertyName();
        this._lastUsedColumns = this._parameters.onGetColumns?.();
        this._homePageGridClientApiRibbonButtonId = this._parameters.onGetHomePageGridClientApiRibbonButtonId?.();
        this._notifyOutputChanged = notifyOutputChanged;
        this._powerAppsDatasetProvider = this._getPowerAppsDatasetProvider();
        this._dataset = this.getDataset() as any;
        if (this._powerAppsDatasetProvider) {
            this._dataset.setColumns(this._parameters.onGetDataset().columns);
        }
        this._dataset.setColumns(this._getColumns());

        if (this.getHeight() === '100%') {
            this._container.classList.add(this._getFullHeightStyles())
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
    }

    /**
     * Returns true if the control should re-render or false if it should not.
     */
    public updateView(context: ComponentFramework.Context<IInputs, IOutputs>) {
        this._context = context;
        //refresh in PowerApps is broken, sometimes the paging will return broken (-100) or not updated
        //calling loadExactPage after refresh occures fixes that (results in more API calls, but whan can you do)
        if (this._getRefreshStatus() === 1 && !this._initialRender) {
            return this._forceRefresh();
        }
        this._refreshOnChange([
            {
                previousValue: this._dataset.getDataSource(),
                currentValue: this._getCurrentFetchXml(),
                beforeRefreshCallback: () => this._dataset.setDataSource(this._getCurrentFetchXml())
            },
            {
                previousValue: this._lastUsedColumns!,
                currentValue: this._parameters.onGetColumns?.(),
                beforeRefreshCallback: () => this._dataset.setColumns(this._getColumns())
            }, {
                previousValue: false,
                currentValue: this._pendingForceRefresh,
                beforeRefreshCallback: () => this._pendingForceRefresh = false
            }
        ])
        this._lastUsedColumns = this._parameters.onGetColumns?.();
        this._initialRender = false;
    }

    public getDataset() {
        if (this._dataset) {
            return this._dataset;
        }
        if (this._powerAppsDatasetProvider) {
            return new Dataset(this._powerAppsDatasetProvider, {
                isVirtual: false
            });
        }
        return this._parameters.onGetDataset();
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
        if (this._powerAppsDatasetProvider) {
            this._dataset.destroy();
        }
    }

    public getHeight(): string | null {
        if (this._isHomePageGrid()) {
            return '100%';
        }
        return this._parameters.onGetHeight?.() ?? null;
    }

    private async _onDatasetInit() {
        const initializationCallback = async () => {
            await this._getOutputsPromise;
            await this._parameters.onInitialize?.();
            if (this._isHomePageGrid() && this._homePageGridClientApiRibbonButtonId) {
                //@ts-ignore - typings
                window.Xrm[this._getGlobalDatasetInstanceName()] = this._dataset;
                //@ts-ignore
                const commands = await this._parameters.onGetDataset().retrieveRecordCommand([], [this._homePageGridClientApiRibbonButtonId]);
                if (commands.length === 0) {
                    this._context.navigation.openErrorDialog({
                        message: `Could not find ribbon button ${this._homePageGridClientApiRibbonButtonId}. Client API will not be enabled.`
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
            //this._powerAppsDatasetProvider?.setPendingChangeFromOutside();
            this._dataset.paging.loadExactPage(this._dataset.paging.pageNumber);
        }
    }

    private _getColumns() {
        try {
            const parameterColumns: IColumn[] = JSON.parse(this._parameters.onGetColumns?.() ?? '[]');
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
        //@ts-ignore - typings
        return this._getNormalizedFetchXml(this._context.factory._customControlProperties.dynamicData.parameters[this._datasetPropertyName].cachedQueryState.fetchXml)
    }

    private _isHomePageGrid(): boolean {
        //@ts-ignore - typings
        return this._context.utils._customControlProperties.contextString === 'grid';
    }
    private _refreshOnChange(objectsToCompare: { currentValue: any, previousValue: any, beforeRefreshCallback?: () => void }[]) {
        /* let shouldRefresh = false;
        objectsToCompare.map(obj => {
            if (obj.currentValue != obj.previousValue) {
                shouldRefresh = true;
                obj.beforeRefreshCallback?.();
            }
        })
        if (shouldRefresh) {
            this._powerAppsDatasetProvider?.setPendingChangeFromOutside();
            this._dataset.paging.loadExactPage(this._dataset.paging.pageNumber);
        }
        queueMicrotask(() => {
            this._powerAppsDatasetProvider?.resolveDataRefresh();
        }) */
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

    private _getRefreshStatus(): number {
        if (this._client.isTalxisPortal()) {
            //dummy refresh status
            return 0;
        }
        //@ts-ignore - typings
        return this._context.utils._customControlProperties.dynamicData.parameters[this._datasetPropertyName].refreshingStatus;
    }

    private _forceRefresh() {
        this._pendingForceRefresh = true;
        setTimeout(() => {
            this._parameters.onGetDataset().paging.loadExactPage(1);
        }, 100);
        return false;
    }

    private _getPowerAppsDatasetProvider() {
        //instead check if it's instance of our dataset?
        if (this._client.isTalxisPortal()) {
            return undefined;
        }
        return new PowerAppsDatasetProvider(this._getCurrentFetchXml(), {
            onGetPowerAppsDataset: () => <any>this._parameters.onGetDataset(),
            events: {
                onColumnsChanged: (ids) => this._setViewColumns(ids),
            }
        })
    }

    private _getDatasetPropertyName(): string {
        for (const key of Object.keys(this._context.parameters)) {
            if (this._context.parameters[key].records) {
                return key;
            }
        }
        throw new Error("Dataset property not found in context parameters");
    }

}