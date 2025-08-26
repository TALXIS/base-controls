import { mergeStyles } from "@fluentui/react";
import { Dataset, FetchXmlDataProvider, IAttributeMetadata, IColumn, IDataProvider, IRawRecord } from "@talxis/client-libraries";

interface IOutputs {
    DatasetControl?: any;
}

interface IParameterGetters {
    DataProviderClass: { new(...args: any[]): IDataProvider }
    onGetDataSource: () => string | IRawRecord[];
    onGetColumns?: () => string | IColumn[];
    onGetEntityMetadata?: () => string | IAttributeMetadata;
    onGetHeight?: () => string | null;
    onGetGroupingType?: () => 'nested' | 'flat';
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
    private _dataset!: Dataset<IDataProvider>;
    private _container!: HTMLDivElement;
    private _notifyOutputChanged!: () => void;
    private _resolveGetOutputs!: (value: boolean | PromiseLike<boolean>) => void;
    private _getOutputsPromise: Promise<boolean> = new Promise(resolve => {
        this._resolveGetOutputs = resolve;
    });
    private _parameters!: IParameterGetters;
    private _initialized: boolean = false;

    public init(notifyOutputChanged: () => void, container: HTMLDivElement, parameters: IParameterGetters): VirtualDatasetAdapter {
        this._parameters = parameters;
        this._container = container;
        this._notifyOutputChanged = notifyOutputChanged;
        const dataSource = parameters.onGetDataSource();
        if (!dataSource) {
            return this;
        }
        const dataProvider = new parameters.DataProviderClass(dataSource, this._getEntityMetadata());
        (<IDataProvider>dataProvider).grouping.setGroupingType(parameters.onGetGroupingType?.() ?? 'nested');
        this._dataset = new Dataset(dataProvider);
        this._dataset.setDataSource(dataSource);
        this._dataset.setMetadata(this._getEntityMetadata());
        if (this._parameters.onGetHeight?.() === '100%') {
            this._container.classList.add(this._getFullTabStyles());
        }
        this._notifyOutputChanged();
        this._onDatasetInit();
        this._initialized = true;
        return this;
    }

    public updateView(context: ComponentFramework.Context<any, IOutputs>, renderComponent: () => void): void {
        if (!this._parameters.onGetDataSource()) {
            return;
        }
        //if not yet initialized, initialize, can happen if we start without data
        if (!this._initialized) {
            this.init(this._notifyOutputChanged, this._container, this._parameters);
        }
        return renderComponent();
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
            this._dataset.setColumns(this._getColumns());
            await this._parameters.onInitialize?.();
        })
    }

    private _getColumns() {
        try {
            const parameterColumns = this._parameters.onGetColumns?.();
            const columns: IColumn[] = Array.isArray(parameterColumns) ? parameterColumns : JSON.parse(parameterColumns ?? "[]");
            if (this._shouldMergeColumns()) {
                return this._getMergedColumns(columns);
            }
            return columns;
        }
        catch (err) {
            console.error(err);
            return this._dataset.columns;
        }
    }

    private _shouldMergeColumns(): boolean {
        if (this._dataset.getDataProvider() instanceof FetchXmlDataProvider) {
            const fetchXml = this._parameters.onGetDataSource() as string;
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
            const parameterMetadata = this._parameters.onGetEntityMetadata?.();
            return typeof parameterMetadata === 'object' ? parameterMetadata : JSON.parse(parameterMetadata ?? "{}");
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