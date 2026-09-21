import * as React from "react";
import { ICommandBarItemProps } from "@fluentui/react";
import { useRerender } from "@legacy";
import { CellCommands } from "../../../../components/cells/commands/CellCommands";
import { CellUi } from "../../../../components/cells/ui";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellControl } from "../../../../components/cells/control/CellControl";
import { CellField } from "../../../../components/cells/field/CellField";
import { CellLoading } from "../../../../components/cells/loading/CellLoading";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { ICellRendererProps } from "../../../../components/cells/cell-renderer/CellRenderer";
import { useGridService } from "../../../../useGridService";
import { getGroupCellStyles } from "./styles";

/** What a column the rows are grouped by draws in its cells: the chevron that opens the group. */
export const GroupCell = (props: ICellRendererProps) => {
    const styles = React.useMemo(() => getGroupCellStyles(), []);
    //this cell belongs to a column the grouping module grouped, so the module is there
    const grouping = useGridService('grouping')!;
    const node = props.node;
    const rerender = useRerender();

    React.useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [node]);

    const getChevronButton = (): ICommandBarItemProps[] => {
        if (!grouping.isGroupRow(node)) {
            return [];
        }
        return [{
            key: 'groupExpansion',
            iconOnly: true,
            iconProps: { iconName: node.expanded ? 'ChevronDown' : 'ChevronRight' },
            onClick: () => grouping.toggleGroup(node),
        }];
    };

    return <CellField record={props.data} name={grouping.getGroupedValueColumnName(props.data, props.colDef!.colId!)}>
        <CellRoot {...props}>
            <CellTheme theme={props.theme}>
                <CellContainer>
                    <CellLoading>
                        <CellUi.Commands items={getChevronButton()} className={styles.commands} />
                        <CellControl />
                        <CellCommands />
                    </CellLoading>
                </CellContainer>
            </CellTheme>
        </CellRoot>
    </CellField>;
};
