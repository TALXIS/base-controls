import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICommandBarItemProps } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { getGroupCellStyles } from "./styles";

/** What a row standing for a group draws in the column it is grouped by: its value, and what opens it. */
export const GroupCell = (props: ICellRendererParams<IRecord>) => {
    const styles = React.useMemo(() => getGroupCellStyles(), []);
    //this cell belongs to a column the grouping module grouped, so the module is there
    const grouping = useGridService('grouping')!;
    const node = props.node;
    const rerender = useRerender();

    React.useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [node]);

    const getChevronButton = (): ICommandBarItemProps[] => [{
        key: 'groupExpansion',
        iconOnly: true,
        iconProps: { iconName: node.expanded ? 'ChevronDown' : 'ChevronRight' },
        onClick: () => grouping.toggleGroup(node),
    }];

    //the selector draws this only for a group row, which is a row with a record of its own
    const record = props.data!;

    return <Grid.Cell.Field record={record} name={grouping.getGroupedValueColumnName(record, props.colDef!.colId!)}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container>
                    <Grid.Cell.Loading>
                        <Grid.Cell.Ui.Commands items={getChevronButton()} className={styles.commands} />
                        <Grid.Cell.Control />
                        <GroupCount />
                        <Grid.Cell.Commands />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
