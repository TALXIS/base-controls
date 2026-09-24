import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICommandBarItemProps, useTheme } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { getGroupCellStyles } from "./styles";

/** What a row standing for a group draws in the column it is grouped by: its value, and what opens it. */
export const GroupCell = (props: ICellRendererParams<IRecord>) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getGroupCellStyles(theme), [theme]);
    //this cell belongs to a column the grouping module grouped, so the module is there
    const grouping = useGridService('grouping')!;
    const node = props.node;
    const rerender = useRerender();

    React.useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [node]);

    const getChevronButton = (): ICommandBarItemProps => ({
        key: 'groupExpansion',
        iconOnly: true,
        iconProps: { iconName: node.expanded ? 'ChevronDown' : 'ChevronRight' },
        buttonStyles: styles.chevronStyles,
        onClick: () => grouping.toggleGroup(node),
    });

    //the selector draws this only for a group row, which is a row with a record of its own
    const record = props.data!;
    //one column of the row opens it, which is the level's own even where the row stands for several
    const isExpandable = grouping.isColumnExpandable(record, props.colDef!.colId!);

    return <Grid.Cell.Field record={record} name={grouping.getGroupedValueColumnName(record, props.colDef!.colId!)}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container>
                    <Grid.Cell.Loading>
                        <Grid.Cell.Ui.Commands alignment="right" items={isExpandable ? [getChevronButton()] : []} className={styles.commands} />
                        <Grid.Cell.Control />
                        {isExpandable && <GroupCount />}
                        <Grid.Cell.Commands />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
