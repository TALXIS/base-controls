import { IInternalDataProvider } from "@talxis/client-libraries";
import { LabelsOf } from "@utils";
import { IDatasetControl } from "@legacy/dataset-control/model/DatasetControl";
import { LEGACY_DATASET_CONTROL_LABELS } from "./labels";

type Labels = LabelsOf<typeof LEGACY_DATASET_CONTROL_LABELS>;

interface IDatasetControlModelOptions {
    datasetControl: IDatasetControl;
    labels: Labels;
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
        return this._options.labels;
    }

    private _registerInterceptors() {
        const dataset = this._options.datasetControl.getDataset()
        const dataProvider = dataset.getDataProvider() as IInternalDataProvider;
        dataProvider.setInterceptor('__unsavedChangesBlocker', (parameters, defaultAction) => {
            if (!dataProvider.isDirty()) {
                return defaultAction(parameters);
            }
            else if (window.confirm(this._options.labels.get('legacyDatasetControl.savingDiscardAllConfirmation')) ) {
                //@ts-ignore
                dataProvider['_dirtyRecordIdsSet'].clear();
                //@ts-ignore
                dataProvider['_invalidRecordFieldIdsSet'].clear();
                return defaultAction(parameters);
            }
        })
    }

}