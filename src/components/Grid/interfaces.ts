import { IDatasetProperty, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";

export interface IGrid extends IComponent<IGridParameters, IGridOutputs, IGridTranslations> {

}

export interface IEntityColumn extends ComponentFramework.PropertyHelper.DataSetApi.Column {
    isResizable?: boolean;
    isFilterable?: boolean;
    isEditable?: boolean;
    isRequired?: boolean;
}
export interface IEntityRecord extends ComponentFramework.PropertyHelper.DataSetApi.EntityRecord {
    setValue: (columnName: string, value: any) => void;
    save: () => Promise<void>;
}

export interface IGridParameters extends IParameters {
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    SelectableRows?: IStringProperty & {
        raw: 'single' | 'multiple' | 'true' | 'single'
    }
    Grid: IDatasetProperty;
}

export interface IGridOutputs extends IOutputs {

}
export interface IGridTranslations extends ITranslations {
    "condition-none": { [LCID: number]: string };
    "condition-equal": { [LCID: number]: string };
    "condition-notequal": { [LCID: number]: string };
    "condition-greaterthan": { [LCID: number]: string };
    "condition-lessthan": { [LCID: number]: string };
    "condition-greaterequal": { [LCID: number]: string };
    "condition-lessequal": { [LCID: number]: string };
    "condition-like": { [LCID: number]: string };
    "condition-notlike": { [LCID: number]: string };
    "condition-null": { [LCID: number]: string };
    "condition-notnull": { [LCID: number]: string };
    "condition-beginwith": { [LCID: number]: string };
    "condition-doesnotbeginwith": { [LCID: number]: string };
    "condition-endswith": { [LCID: number]: string };
    "condition-doesnotendwith": { [LCID: number]: string };
    "condition-yesterday": { [LCID: number]: string };
    "condition-today": { [LCID: number]: string };
    "condition-tomorrow": { [LCID: number]: string };
    "condition-last7days": { [LCID: number]: string };
    "condition-next7days": { [LCID: number]: string };
    "condition-lastweek": { [LCID: number]: string };
    "condition-thisweek": { [LCID: number]: string };
    "condition-lastmonth": { [LCID: number]: string };
    "condition-thismonth": { [LCID: number]: string };
    "condition-on": { [LCID: number]: string };
    "condition-onorbefore": { [LCID: number]: string };
    "condition-onorafter": { [LCID: number]: string };
    "condition-lastyear": { [LCID: number]: string };
    "condition-thisyear": { [LCID: number]: string };
    "condition-lastxdays": { [LCID: number]: string };
    "condition-nextxdays": { [LCID: number]: string };
    "condition-lastxmonths": { [LCID: number]: string };
    "condition-nextxmonths": { [LCID: number]: string };
    "condition-contains": { [LCID: number]: string };
    "condition-infiscalperiodandyear": { [LCID: number]: string };
    "condition-above": { [LCID: number]: string };
    "condition-under": { [LCID: number]: string };
    "condition-notunder": { [LCID: number]: string };
    "condition-aboveorequal": { [LCID: number]: string };
    "condition-underorequal": { [LCID: number]: string };
    "condition-containvalues": { [LCID: number]: string };
    "condition-doesnotcontainvalues": { [LCID: number]: string };
    "filtermenu-filterby": { [LCID: number]: string };
    "filtermenu-applybutton": { [LCID: number]: string };
    "filtermenu-clearbutton": { [LCID: number]: string };
    "filtersortmenu-sorttext-a-z": { [LCID: number]: string };
    "filtersortmenu-sorttext-z-a": { [LCID: number]: string };
    "filtersortmenu-sortdate-a-z": { [LCID: number]: string };
    "filtersortmenu-sortdate-z-a": { [LCID: number]: string };
    "filtersortmenu-sortnumber-a-z": { [LCID: number]: string };
    "filtersortmenu-sortnumber-z-a": { [LCID: number]: string };
    "filtersortmenu-sorttwooption-a-z": { [LCID: number]: string };
    "filtersortmenu-sorttwooption-z-a": { [LCID: number]: string };
    "filtersortmenu-sorttwooption-joint": { [LCID: number]: string };
    "filtersortmenu-filterby": { [LCID: number]: string };
    "filtersortmenu-clearfilter": { [LCID: number]: string };
    "paging-pages": { [LCID: number]: string };
    "paging-of": { [LCID: number]: string };
    "paging-firstpage": { [LCID: number]: string };
    "paging-previouspage": { [LCID: number]: string };
    "paging-page": { [LCID: number]: string };
    "paging-nextpage": { [LCID: number]: string };
    "paging-lastpage": { [LCID: number]: string };
    "norecordsfound": { [LCID: number]: string };
    "saving-changenotification": { [LCID: number]: string };
    "saving-save": { [LCID: number]: string };
    "saving-saving": { [LCID: number]: string };
    "saving-changepreview-title": { [LCID: number]: string };
    "saving-validation-error": { [LCID: number]: string };
    "validation-input-value": { [LCID: number]: string };
    "validation-email": { [LCID: number]: string };
    "validation-url": { [LCID: number]: string };
    "validation-date": { [LCID: number]: string };
    "validation-number": { [LCID: number]: string };
}