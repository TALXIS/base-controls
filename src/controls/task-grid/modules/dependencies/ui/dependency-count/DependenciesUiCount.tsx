import { useTheme } from "@theme";
import { useMemo } from "react";

import { DependenciesUiCountComponents, IDependenciesUiCountComponents } from "./components";
import { getDependenciesUiCountStyles } from "./styles";

export interface IDependenciesUiCountProps {
    direction: 'predecessors' | 'successors';
    count: number;
    components?: Partial<IDependenciesUiCountComponents>;
}

/** How many dependencies a task has in one direction. */
export const DependenciesUiCount = (props: IDependenciesUiCountProps) => {
    const { direction, count } = props;
    const components = { ...DependenciesUiCountComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getDependenciesUiCountStyles(theme), [theme]);

    if (count === 0) {
        return null;
    }
    return components.onRender({
        className: styles.root,
        children: <>
            {components.onRenderIcon({ iconName: 'Link', className: styles.icon })}
            {components.onRenderArrow({ iconName: direction === 'predecessors' ? 'SortDown' : 'SortUp', className: styles.arrow })}
            {components.onRenderCount({ children: count })}
        </>,
    });
};
