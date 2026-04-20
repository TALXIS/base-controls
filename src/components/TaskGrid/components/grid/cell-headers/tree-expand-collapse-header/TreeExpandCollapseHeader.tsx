import { IconButton } from "@fluentui/react";
import { ICellProps } from "../../../../../Grid/cells/cell/Cell"
import * as React from "react"
import { getTreeExpandCollapseHeaderStyles } from "./styles";
import { useTaskDataProvider } from "../../../../context";

export const TreeExpandCollapseHeader = (props: ICellProps) => {
    const styles = React.useMemo(() => getTreeExpandCollapseHeaderStyles(), []);
    const taskDataProvider = useTaskDataProvider();
    const { api } = { ...props }
    
    if (taskDataProvider.isFlatListEnabled()) {
        return <></>
    }
    else {
        return (
            <div className={styles.root}>
                <IconButton onClick={() => api.expandAll()} styles={{
                    root: styles.button
                }} iconProps={{
                    iconName: 'Add',
                    styles: {
                        root: styles.icon
                    },
                }} />
                <IconButton onClick={() => api.collapseAll()} styles={{
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