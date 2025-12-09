import { IInternalDataProvider } from "@talxis/client-libraries";
import { ITranslation } from "../../hooks";
import { IDatasetControl } from "../../utils/dataset-control";
import { datasetControlTranslations } from "./translations";

type Labels = Required<ITranslation<typeof datasetControlTranslations>>;

interface IDatasetControlModelOptions {
    datasetControl: IDatasetControl;
    getLabels: () => Labels;
}

export class DatasetControlModel {
    private _options: IDatasetControlModelOptions;

    constructor(options: IDatasetControlModelOptions) {
        this._options = options;
        this._registerInterceptors();
    }
    public getDatasetControl(): IDatasetControl {
        return this._options.datasetControl;
    }
    public getLabels(): Labels {
        return this._options.getLabels();
    }

    //here due to translations, should be part of DatasetControl when we have translations settled
    private _registerInterceptors() {
        const dataset = this._options.datasetControl.getDataset()
        const dataProvider = dataset.getDataProvider() as IInternalDataProvider;
        dataProvider.setInterceptor('__unsavedChangesBlocker', (parameters, defaultAction) => {
            if (!dataProvider.isDirty()) {
                return defaultAction(parameters);
            }
            else if (window.confirm(this._options.getLabels()['saving-discard-all-confirmation']()) ) {
                //@ts-ignore
                dataProvider['_dirtyRecordIdsSet'].clear();
                //@ts-ignore
                dataProvider['_invalidRecordFieldIdsSet'].clear();
                return defaultAction(parameters);
            }
        })
    }

}