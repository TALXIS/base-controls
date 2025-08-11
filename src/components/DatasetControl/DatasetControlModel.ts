import { ITranslation } from "../../hooks";
import { IDatasetControl } from "./interfaces";
import { datasetControlTranslations } from "./translations";

type Labels = Required<ITranslation<typeof datasetControlTranslations>>;

interface IDatasetControlModelDeps {
    getProps: () => IDatasetControl;
    getLabels: () => Labels;
}

export class DatasetControlModel {
    private _getProps: () => IDatasetControl;
    private _getLabels: () => Labels;


    constructor(deps: IDatasetControlModelDeps) {
        this._getProps = deps.getProps;
        this._getLabels = deps.getLabels;
        this._registerInterceptors();
        this.getDataset().paging.loadExactPage(this.getDataset().paging.pageNumber);
    }

    public isPaginationVisible(): boolean {
        if (this._getParameters().EnablePagination?.raw !== false) {
            return true;
        }
        return false;
    }
    public isRecordCountVisible(): boolean {
        if (this._getParameters().ShowRecordCount?.raw !== false) {
            return true;
        }
        return false;
    }
    public isPageSizeSwitcherVisible(): boolean {
        if (this._getParameters().EnablePageSizeSwitcher?.raw !== false) {
            return true;
        }
        return false;
    }
    public isQuickFindVisible(): boolean {
        return this._getParameters().EnableQuickFind?.raw ?? false;
    }
    public isAutoSaveEnabled(): boolean {
        return false;
    }
    public isRibbonVisible(): boolean {
        return true;
    }
    public isUnsavedChangesMessageBarVisible(): boolean {
        switch (true) {
            case !this.getDataset().isDirty():
            case this.getDataset().error:
            case this.isAutoSaveEnabled(): {
                return false;
            }
            default: {
                return true;
            }
        }
    }
    public getDataset() {
        return this._getParameters().Grid;
    }
    public getLabels(): Labels {
        return this._getLabels();
    }
    private _getParameters() {
        return this._getProps().parameters;
    }
    private _registerInterceptors() {
        this.getDataset().setInterceptor('__onGetData', (defaultAction) => {
            if (this.getDataset().isDirty()) {
                if (window.confirm(this.getLabels()['saving-discard-all-confirmation']())) {
                    return defaultAction();
                }
            }
            else {
                return defaultAction();
            }
        })
    }

}