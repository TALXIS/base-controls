import * as React from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { useRerender } from "@legacy";
import { Grid } from "../../../../namespace";
import { ICellRendererProps } from "../../../../components/cells/cell-renderer/CellRenderer";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { getGroupedRowCellStyles } from "./styles";

/** What a row standing for a group draws in the column it is grouped by: its value, and what opens it. */
export const GroupedRowCell = (props: ICellRendererProps) => {
    const styles = React.useMemo(() => getGroupedRowCellStyles(), []);
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

    return <Grid.Cell.Field record={props.data} name={grouping.getGroupedValueColumnName(props.data, props.colDef!.colId!)}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme theme={props.theme}>
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
