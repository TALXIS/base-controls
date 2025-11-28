import { ITranslation } from "../../hooks";
import { IDatasetControl } from "../../utils/dataset-control";
import { datasetControlTranslations } from "./translations";

type Labels = Required<ITranslation<typeof datasetControlTranslations>>;

interface IDatasetControlModelOptions {
    datasetControl: IDatasetControl;
    getLabels: () => Labels;
}

export class DatasetControlModel  {
    private _options: IDatasetControlModelOptions;

    constructor(options: IDatasetControlModelOptions) {
        this._options = options;
    }
    public getDatasetControl(): IDatasetControl {
        return this._options.datasetControl;
    }
    public getLabels(): Labels {
        return this._options.getLabels();
    }

}