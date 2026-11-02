import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { DependencyCountComponents, IDependencyCountComponents } from "./components";
import { getDependencyCountStyles } from "./styles";

export interface IDependencyCountProps {
    direction: 'predecessors' | 'successors';
    count: number;
    components?: Partial<IDependencyCountComponents>;
}

/** How many dependencies a task has in one direction. */
export const DependencyCount = (props: IDependencyCountProps) => {
    const { direction, count } = props;
    const components = { ...DependencyCountComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getDependencyCountStyles(theme), [theme]);

    if (count === 0) {
        return null;
    }
    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderIcon({ iconName: 'Link', className: styles.icon })}
            {components.onRenderArrow({ iconName: direction === 'predecessors' ? 'SortDown' : 'SortUp', className: styles.arrow })}
            {components.onRenderCount({ children: count })}
        </>,
    });
};
