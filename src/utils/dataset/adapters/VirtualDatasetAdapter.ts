import { mergeStyles } from "@fluentui/react";
import { Dataset, FetchXmlDataProvider, IColumn, IDataProvider, MemoryDataProvider } from "@talxis/client-libraries";

interface IOutputs {
    DatasetControl?: any;
}

interface IParameterGetters {
    dataProviderType: "Memory" | "FetchXml" | 'Custom';
    onGetData: () => string | null;
    onGetColumns: () => string | null;
    onGetEntityMetadata: () => string | null;
    customDataProvider?: IDataProvider;
    onGetHeight?: () => string | null;
    /**
     * Callback that gets triggered and awaited before the dataset is initialized. Useful for setting initialization code that needs to run before the dataset is ready.
     */
    onInitialize?: () => void | Promise<void>
}

/**
 * Helper class that holds boilerplate code for handling a virtual dataset in PCF, like syncing data, columns, and metadata from parameters.
 *
 */
export class VirtualDatasetAdapter {
    private _providerClasses = {
        'FetchXml': FetchXmlDataProvider,
        'Memory': MemoryDataProvider
    };
    private _dataset!: Dataset<IDataProvider>;
    private _parsedData: any = null;
    private _lastUsedColumns: string | null = null;
    private _lastUsedData: string | null = null;
    private _lastUsedMetadata: string | null = null;
    private _dataProviderClass!: (typeof this._providerClasses[keyof typeof this._providerClasses]);
    private _container!: HTMLDivElement;
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });
    private _parameters!: IParameterGetters;

    public init(notifyOutputChanged: () => void, container: HTMLDivElement, parameters: IParameterGetters) {
        this._parameters = parameters;
        this._notifyOutputChanged = notifyOutputChanged;
        this._container = container;
        let dataProvider: any = null;
        if(parameters.dataProviderType !== 'Custom') {
            //@ts-ignore - typings
            this._dataProviderClass = this._providerClasses[this._parameters.dataProviderType];
            dataProvider = new this._dataProviderClass(this._getData(), this._getEntityMetadata());
        }
        else {
            dataProvider = this._parameters.customDataProvider;
        }
        //@ts-ignore - typings
        this._dataset = new Dataset(dataProvider);
        this._dataset.setColumns(this._getColumns());
        this._dataset.setMetadata(this._getEntityMetadata());

        if (this._parameters.onGetHeight?.() === '100%') {
            this._container.classList.add(this._getFullTabStyles());
        }
        this._lastUsedColumns = this._parameters.onGetColumns();
        this._lastUsedData = this._parameters.onGetData();
        this._lastUsedMetadata = this._parameters.onGetEntityMetadata();
        this._notifyOutputChanged();
        this._onDatasetInit();
        return this;
    }

    public updateView(): void {
        this._parsedData = null;
        this._refreshOnChange([
            {
                previousValue: this._lastUsedColumns,
                currentValue: this._parameters.onGetColumns(),
                beforeRefreshCallback: () => this._dataset.setColumns(this._getColumns())
            },
            {
                previousValue: this._lastUsedData,
                currentValue: this._parameters.onGetData(),
                beforeRefreshCallback: () => {
                    this._dataset.setDataSource(this._getData());
                    this._dataset.setColumns(this._getColumns());
                }
            },
            {
                previousValue: this._lastUsedMetadata,
                currentValue: this._parameters.onGetEntityMetadata(),
                beforeRefreshCallback: () => this._dataset.setMetadata(this._getEntityMetadata())
            }
        ]);
        this._lastUsedColumns = this._parameters.onGetColumns();
        this._lastUsedData = this._parameters.onGetData();
        this._lastUsedMetadata = this._parameters.onGetEntityMetadata();
    }

    public getDataset(): Dataset<IDataProvider> {
        return this._dataset;
    }

    public destroy(): void {
        this._dataset.destroy();
    }

    public getOutputs(): IOutputs {
        this._resolveGetOutputs(true);
        return {
            DatasetControl: this.getDataset()
        };
    }

    private _onDatasetInit() {
        this.getDataset().setInterceptor('onInitialize', async () => {
            await this._getOutputsPromise;
            await this._parameters.onInitialize?.();
        })
    }

    private _getData() {
        if (this._parsedData) {
            return this._parsedData;
        }
        this._parsedData = this._dataProviderClass.GetParsedData(this._parameters.onGetData());
        return this._parsedData;
    }

    private _getColumns() {
        try {
            const parameterColumns: IColumn[] = JSON.parse(this._parameters.onGetColumns() ?? "[]");
            if (this._shouldMergeColumns()) {
                return this._getMergedColumns(parameterColumns);
            }
            return parameterColumns;
        }
        catch (err) {
            console.error(err);
            return this._dataset.columns;
        }
    }

    private _shouldMergeColumns(): boolean {
        if (this._dataset.getDataProvider() instanceof FetchXmlDataProvider) {
            const fetchXml = this._parameters.onGetData();
            if (fetchXml?.includes('savedqueryid') || fetchXml?.includes('userqueryid')) {
                return true;
            }
        }
        return false;
    }

    private _getMergedColumns(parameterColumns: IColumn[]): IColumn[] {
        const columnsMap = new Map(this._dataset.columns.map(col => [col.name, col]));
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
        return [...columnsMap.values()];
    }

    private _getEntityMetadata() {
        try {
            return JSON.parse(this._parameters.onGetEntityMetadata() ?? "{}");
        }
        catch (err) {
            console.error(err);
            return this._dataset.getMetadata();
        }
    }

    private _refreshOnChange(objectsToCompare: { currentValue: string | null, previousValue: string | null, beforeRefreshCallback?: () => void }[]) {
        let shouldRefresh = false;
        objectsToCompare.forEach(obj => {
            if (obj.currentValue !== obj.previousValue) {
                shouldRefresh = true;
                obj.beforeRefreshCallback?.();
            }
        });
        if (shouldRefresh) {
            this._dataset.paging.loadExactPage(this._dataset.paging.pageNumber);
        }
    }

    private _getFullTabStyles() {
        return mergeStyles({
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
        });
    }
}