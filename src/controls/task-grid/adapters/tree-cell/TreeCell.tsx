import { useEffect } from "react";
import { ICellRendererParams } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { useRerender } from "@core";
import { Grid, GroupingUi } from "../../../grid";
import { useTaskGridService } from "../../useTaskGridServices";
import { useTaskGridContext } from "../../context";
import { useTaskRuntime } from "../root/context";
import { TaskGridUiTreeCellIndent } from "../../ui";
import { mergeComponentNamespaces } from "../mergeComponentNamespaces";
import { ITreeCellComponents } from "./components";

export interface ITreeCellProps extends ICellRendererParams<IRecord> {
    components?: ITreeCellComponents;
}

/** The subject cell, indented by its level with the chevron that opens the task. */
export const TreeCell = (props: ITreeCellProps) => {
    const expansion = useTaskGridService('taskExpansion');
    const runtime = useTaskRuntime();
    const components = mergeComponentNamespaces(useTaskGridContext().components.treeCell, props.components);
    const { rerender } = useRerender();
    const node = props.node;
    const record = props.data!;
    const isFlatList = runtime.isFlatList();
    const hasToggle = !isFlatList && !!node.group;

    useEffect(() => {
        node.addEventListener('expandedChanged', rerender);
        node.addEventListener('groupChanged', rerender);
        node.addEventListener('uiLevelChanged', rerender);
        return () => {
            node.removeEventListener('expandedChanged', rerender);
            node.removeEventListener('groupChanged', rerender);
            node.removeEventListener('uiLevelChanged', rerender);
        };
    }, [node]);

    return <Grid.Cell.Field record={record} name={props.colDef!.colId!}>
        <Grid.Cell.Root {...props}>
            <Grid.Cell.Theme>
                <Grid.Cell.Container components={components.container}>
                    <Grid.Cell.Loading components={components.loading}>
                        <TaskGridUiTreeCellIndent level={isFlatList ? 0 : node.level} hasToggle={hasToggle || isFlatList} components={components.indent} />
                        {hasToggle && <GroupingUi.Toggle isExpanded={!!node.expanded} onToggle={() => expansion.toggle(record.getRecordId())} components={components.toggle} />}
                        <Grid.Cell.LockIcon components={components.lockIcon} />
                        <Grid.Cell.Control components={components.control}>
                            <Grid.Cell.ColumnControl components={components.columnControl} />
                        </Grid.Cell.Control>
                        <Grid.Cell.Commands components={components.commands} />
                        <Grid.Cell.FieldError components={components.fieldError} />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.Theme>
        </Grid.Cell.Root>
    </Grid.Cell.Field>;
};
