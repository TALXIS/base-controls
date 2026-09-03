import { IconButton } from "@fluentui/react";
import { ICellProps } from "@components/Grid/cells/cell/Cell"
import * as React from "react"
import { getTreeExpandCollapseHeaderStyles } from "./styles";
import { useServices, useTaskDataProvider } from "@components/TaskGrid/context";

/** Header of the subject column, carrying the expand-all / collapse-all toggle. */
export const TreeExpandCollapseHeader = (props: ICellProps) => {
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