import { useEffect } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@legacy";
import { ITheme } from "@theme";
import { CellField } from "../../../../components/cells/field/CellField";
import { CellRoot } from "../../../../components/cells/root/CellRoot";
import { CellTheme } from "../../../../components/cells/theme/CellTheme";
import { CellContainer } from "../../../../components/cells/container/CellContainer";
import { CellLoading } from "../../../../components/cells/loading/CellLoading";
import { CellControl } from "../../../../components/cells/control/CellControl";
import { CellCommands } from "../../../../components/cells/commands/CellCommands";
import { useGridService } from "../../../../useGridService";
import { GroupCount } from "../group-count/GroupCount";
import { GroupingUi } from "../ui";

export interface IGroupCellProps extends ICellRendererParams<IRecord> {
    /** The seed the cell's theme is generated from, in place of the grid's own striped by row. */
    theme?: ITheme;
}

/** What a group row draws in its grouped column: its value and its chevron. */
export const GroupCell = (props: IGroupCellProps) => {
    //the grouping module is registered wherever this cell draws
    const grouping = useGridService('grouping')!;
    const node = props.node;
    const rerender = useRerender();
    const components = grouping.components.groupCell ?? {};

    useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [node]);

    //the selector draws this only for a group row, so the record is there
    const record = props.data!;
    //only the level's own column opens the row
    const isExpandable = grouping.isColumnExpandable(record, props.colDef!.colId!);

    return <CellField record={record} name={grouping.getGroupedValueColumnName(record, props.colDef!.colId!)}>
        <CellRoot {...props}>
            <CellTheme theme={props.theme}>
                <CellContainer components={components.container}>
                    <CellLoading components={components.loading}>
                        {isExpandable && <GroupingUi.Toggle isExpanded={!!node.expanded} onToggle={() => grouping.toggleGroup(node)} components={components.toggle} />}
                        <CellControl components={components.control} />
                        {isExpandable && <GroupCount components={components.count} />}
                        <CellCommands components={components.commands} />
                    </CellLoading>
                </CellContainer>
            </CellTheme>
        </CellRoot>
    </CellField>;
};
