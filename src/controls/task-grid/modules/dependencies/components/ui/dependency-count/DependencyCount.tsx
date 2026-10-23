import { useMemo } from "react";
import { Icon, Text, useTheme } from "@fluentui/react";
import { getDependencyCountStyles } from "./styles";

export interface IDependencyCountProps {
    direction: 'predecessors' | 'successors';
    count: number;
}

/** How many dependencies a task has in one direction; nothing for none. */
export const DependencyCount = (props: IDependencyCountProps) => {
    const { direction, count } = props;
    const theme = useTheme();
    const styles = useMemo(() => getDependencyCountStyles(theme), [theme]);

    if (count === 0) {
        return null;
    }
    return <div className={styles.root}>
        <Icon iconName='Link' className={styles.icon} />
        <Icon iconName={direction === 'predecessors' ? 'SortDown' : 'SortUp'} className={styles.arrow} />
        <Text>{count}</Text>
    </div>;
};
