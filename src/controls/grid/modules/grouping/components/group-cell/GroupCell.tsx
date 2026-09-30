import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { GroupingUi } from "../ui";
import { IGroupCellComponents } from "./components";

export interface IGroupCellProps extends ICellRendererParams<IRecord> {
    components?: IGroupCellComponents;
}

/** What a group row draws in its grouped column: its value and its chevron. */
export const GroupCell = (props: IGroupCellProps) => {
    //the grouping module is registered wherever this cell draws
    const grouping = useGridService('grouping')!;
    const node = props.node;
    const rerender = useRerender();
    const components = props.components ?? {};

    React.useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [node]);

    //the selector draws this only for a group row, so the record is there
    const record = props.data!;
    //only the level's own column opens the row
    const isExpandable = grouping.isColumnExpandable(record, props.colDef!.colId!);

    return <Grid.Cell.Field record={record} name={grouping.getGroupedValueColumnName(record, props.colDef!.colId!)}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container components={components.container}>
                    <Grid.Cell.Loading components={components.loading}>
                        {isExpandable && <GroupingUi.Toggle isExpanded={!!node.expanded} onToggle={() => grouping.toggleGroup(node)} components={components.toggle} />}
                        <Grid.Cell.Control components={components.control} />
                        {isExpandable && <GroupCount components={components.count} />}
                        <Grid.Cell.Commands components={components.commands} />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
