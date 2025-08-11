import { mergeStyles } from "@fluentui/react";
import { Dataset, FetchXmlDataProvider, IColumn, IDataProvider, IGroupByMetadata, MemoryDataProvider } from "@talxis/client-libraries";

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
    onInitialize?: () => void | Promise<void>;
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
        if (parameters.dataProviderType !== 'Custom') {
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
        this._dataset.setDataSource(this._getData());
        this._dataset.setMetadata(this._getEntityMetadata());
        if (this._parameters.onGetHeight?.() === '100%') {
            this._container.classList.add(this._getFullTabStyles());
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
        return this;
    }

    public updateView(): void {
        
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
        return this._dataProviderClass.GetParsedData(this._parameters.onGetData()) as any;
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

    private _getFullTabStyles() {
        return mergeStyles({
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
        });
    }
}