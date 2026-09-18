import { IconButton } from "@fluentui/react";
import { IGridCellParams } from "@controls/grid"
import * as React from "react"
import { getTreeExpandCollapseHeaderStyles } from "./styles";
import { useServices, useTaskDataProvider } from "@controls/task-grid/context";

/** Header of the subject column, carrying the expand-all / collapse-all toggle. */
export const TreeExpandCollapseHeader = (props: IGridCellParams) => {
    const styles = React.useMemo(() => getTreeExpandCollapseHeaderStyles(), []);
    const taskDataProvider = useTaskDataProvider();
    const expansion = useServices().get('taskExpansion');
    
    if (taskDataProvider.isFlatListEnabled()) {
        return <></>
    }
    else {
        return (
            <div className={styles.root}>
                <IconButton onClick={() => expansion.expandAll()} styles={{
                    root: styles.button
                }} iconProps={{
                    iconName: 'Add',
                    styles: {
                        root: styles.icon
                    },
                }} />
                <IconButton onClick={() => expansion.collapseAll()} styles={{
                    root: styles.button
                }} iconProps={{
                    styles: {
                        root: styles.icon
                    },
                    iconName: 'Remove'
                }} />
            </div>
        );
    }
}