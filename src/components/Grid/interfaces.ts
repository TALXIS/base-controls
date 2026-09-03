import { AgGridReactProps } from "@ag-grid-community/react";
import { ITranslation } from "@hooks";
import { IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "@interfaces";
import { IControl, IOutputs } from "@interfaces/context";
import { gridTranslations } from "./translations";
import { IDataset, IRecord } from "@talxis/client-libraries";


export interface IGrid extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof gridTranslations>>, AgGridReactProps> {
    /**
     * The records the grid renders, for a grid told to run on the client-side row model
     * (`rowModelType: 'clientSide'` through `onOverrideComponentProps`).
     *
     * That model holds every row at once instead of asking a datasource for one level at a time, so the
     * rows have to be handed to it — and only the caller knows what they are: a hierarchy gives every
     * level in display order, a flat grid gives its page. Ignored on the server-side model, which is the
     * default and pages through {@link IDataset} itself.
     */
    onGetRowData?: () => IRecord[];
}

export interface IGridParameters extends IParameters {
    Grid: IDataset;
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableRecordCount?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableChangeEditor?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableMultiEdit?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableZebra?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableGrouping?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableAggregation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableGroupedColumnsPinning?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableCommandBar?: Omit<ITwoOptionsProperty, 'attributes'>;
    RowHeight?: Omit<IWholeNumberProperty, 'attributes'>;
    /**
     * How many rows the grid grows to fit before it starts scrolling instead. Only applies while
     * `Height` is unset — an explicit height always wins.
     */
    MaxVisibleRows?: Omit<IWholeNumberProperty, 'attributes'>;
    EnablePageSizeSwitcher?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableAutoSave?: Omit<ITwoOptionsProperty, 'attributes'>;
    DefaultExpandedGroupLevel?: Omit<IWholeNumberProperty, 'attributes'>;
    
    Height?: IStringProperty;
    InlineRibbonButtonIds?: IStringProperty;
    GroupingType?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"nested" | "flat">, 'type'>;
    SelectableRows?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">, 'type'>;
    LicenseKey?: IStringProperty;
}

export interface IGridOutputs extends IOutputs {

}