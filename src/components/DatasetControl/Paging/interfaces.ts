import { IControl, IParameters, ITranslations, ITwoOptionsProperty } from "../../../interfaces";
import { IDataset } from "@talxis/client-libraries";
import { datasetPagingTranslations } from "./translations";


export interface IDatasetPaging extends IControl<IDatasetPagingParameters, any, Partial<ITranslations<typeof datasetPagingTranslations>>, any> {
}

export interface IDatasetPagingParameters extends IParameters {
    Dataset: IDataset;
    
    /**
     * If set to false, the user will not be able to navigate through pages. The component will still display the total number of records and the current page.
     */
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    /**
     * If set to false, the user will not be able to change the page size.
     */
    EnablePageSizeSwitcher?: Omit<ITwoOptionsProperty, 'attributes'>;
}
