import * as React from "react";
import { createAggregationModule, createGroupingModule, createLicenseModule, createFilteringModule, createSortingModule, createRowSelectionModule, createServerSideRowModelModule, Grid as GridBase, IGridModules } from "@controls/grid";
import { useTheme } from "@fluentui/react";
import { IDatasetControlProps } from "@controls/dataset-control/interfaces";
import { ICheckListDatasetControl } from "../../CheckListDatasetControl";
import { CheckListGridCustomizer } from "./grid-customizer";
import { createCheckListGridModule } from "./checkListGridModule";
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
    const theme = useTheme();
    const styles = React.useMemo(() => getCheckListGridStyles(theme), [theme]);

    const selectionMode = parameters.SelectableRows?.raw ?? 'multiple';
    const modules = React.useMemo<IGridModules>(() => ({
        license: parameters.LicenseKey?.raw ? createLicenseModule({ key: parameters.LicenseKey.raw }) : undefined,
        rowModel: createServerSideRowModelModule(),
        //`'none'` is not a mode: a grid that should not offer selection is one with no selection module
        rowSelection: selectionMode === 'none' ? undefined : createRowSelectionModule({ mode: selectionMode }),
        sorting: parameters.EnableSorting?.raw !== false ? createSortingModule() : undefined,
        filtering: parameters.EnableFiltering?.raw !== false ? createFilteringModule() : undefined,
        aggregation: parameters.EnableAggregation?.raw === true ? createAggregationModule() : undefined,
        grouping: parameters.EnableGrouping?.raw === true ? createGroupingModule({
            type: parameters.GroupingType?.raw ?? 'nested',
            defaultExpandedLevel: parameters.DefaultExpandedGroupLevel?.raw ?? -1,
            pinGroupedColumns: parameters.EnableGroupedColumnsPinning?.raw !== false,
        }) : undefined,
        custom: [createCheckListGridModule(datasetControl, styles.checkListGridRoot)],
    }), []);

    return <GridBase.Root
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
    />
}
