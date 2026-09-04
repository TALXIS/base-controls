import * as React from "react";
import { IRecord } from "@talxis/client-libraries";
import { AgGridReact, createAggregationModule, createGroupingModule, createServerSideGroupingStrategy, createLicenseModule, createFilteringModule, createSortingModule, createSelectionModule, createServerSideRowModelModule, Grid as GridBase, IGridModules } from "@components/Grid";
import { useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { IDatasetControlProps } from "@components/DatasetControl/interfaces";
import { ICheckListDatasetControl } from "../../CheckListDatasetControl";
import { CheckListGridCustomizer } from "./grid-customizer";
import { getCheckListGridStyles } from "./styles";

type IControlProps = Parameters<IDatasetControlProps['onGetControlComponent']>[0];

/** Props for the checklist's {@link Grid}. */
export interface ICheckListGridProps extends IControlProps {
    datasetControl: ICheckListDatasetControl;
}

/**
 * The checklist's AG Grid instance, configured by {@link CheckListGridCustomizer}.
 *
 * A component of its own because the dataset control renderer hands the grid only the props it was given
 * itself, so the checklist's customizer, its row transition and its drag label have nowhere else to be
 * attached.
 */
export const Grid = (props: ICheckListGridProps) => {
    const { datasetControl, parameters } = props;
    const customizerRef = React.useRef<CheckListGridCustomizer>();
    const theme = useTheme();
    const styles = React.useMemo(() => getCheckListGridStyles(theme), [theme]);

    const selectionMode = parameters.SelectableRows?.raw ?? 'multiple';
    const modules = React.useMemo<IGridModules>(() => ({
        license: parameters.LicenseKey?.raw ? createLicenseModule({ key: parameters.LicenseKey.raw }) : undefined,
        rowModel: createServerSideRowModelModule(),
        //`'none'` is not a mode: a grid that should not offer selection is one with no selection module
        selection: selectionMode === 'none' ? undefined : createSelectionModule({ mode: selectionMode }),
        sorting: parameters.EnableSorting?.raw !== false ? createSortingModule() : undefined,
        filtering: parameters.EnableFiltering?.raw !== false ? createFilteringModule() : undefined,
        aggregation: parameters.EnableAggregation?.raw === true ? createAggregationModule() : undefined,
        grouping: parameters.EnableGrouping?.raw === true ? createGroupingModule({
            strategy: createServerSideGroupingStrategy(),
            type: parameters.GroupingType?.raw ?? 'nested',
            defaultExpandedLevel: parameters.DefaultExpandedGroupLevel?.raw ?? -1,
            pinGroupedColumns: parameters.EnableGroupedColumnsPinning?.raw !== false,
        }) : undefined,
    }), []);

    return <GridBase
        provider={parameters.Grid.getDataProvider()}
        modules={modules}
        enableEditing={parameters.EnableEditing?.raw === true}
        enableNavigation={parameters.EnableNavigation?.raw !== false}
        enableAutoSave={parameters.EnableAutoSave?.raw === true}
        enableZebra={parameters.EnableZebra?.raw !== false}
        enableOptionSetColors={parameters.EnableOptionSetColors?.raw === true}
        rowHeight={parameters.RowHeight?.raw ?? undefined}
        maxVisibleRows={parameters.MaxVisibleRows?.raw ?? undefined}
        height={parameters.Height?.raw ?? undefined}
        state={props.state?.AgGridState}
        components={{
            onRenderAgGrid: (agGridProps) => <AgGridReact
                {...agGridProps}
                //the grid's own root is not where the row transition can live: this one lands on the
                //ag-root-wrapper, above the animated rows
                className={getClassNames([agGridProps.className, styles.checkListGridRoot])}
                //`rowDragText` is an initial-only option, so it cannot be set from the customizer. Without
                //it the drag ghost reads "1 row"; the item's own label is more use.
                rowDragText={(params) => {
                    const record = params.rowNode?.data as IRecord | undefined;
                    return record?.getFormattedValue(datasetControl.getFieldMapping().name) ?? '';
                }}
                onGridReady={(event) => {
                    //before the grid's own handler: that runs its init, which pushes the first columns,
                    //and those need to arrive through the customizer's patched setter
                    customizerRef.current = new CheckListGridCustomizer({
                        gridApi: event.api,
                        datasetControl: datasetControl
                    });
                    agGridProps.onGridReady?.(event);
                }}
            />
        }}
    />
}
