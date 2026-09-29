import * as React from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { ICommandBarItemProps, useTheme } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { Grid } from "../../../../namespace";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { getGroupCellStyles } from "./styles";

/** What a group row draws in its grouped column: its value and its chevron. */
export const GroupCell = (props: ICellRendererParams<IRecord>) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getGroupCellStyles(theme), [theme]);
    //the grouping module is registered wherever this cell draws
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

    //the selector draws this only for a group row, so the record is there
    const record = props.data!;
    //only the level's own column opens the row
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
