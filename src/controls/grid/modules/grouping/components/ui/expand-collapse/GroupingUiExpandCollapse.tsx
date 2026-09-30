import { useMemo } from "react";
import { GroupingUiExpandCollapseComponents, IGroupingUiExpandCollapseComponents } from "./components";
import { getGroupingUiExpandCollapseStyles } from "./styles";

export interface IGroupingUiExpandCollapseProps {
    expandTitle: string;
    collapseTitle: string;
    canExpand: boolean;
    canCollapse: boolean;
    onExpand: () => void;
    onCollapse: () => void;
    components?: Partial<IGroupingUiExpandCollapseComponents>;
}

/** The buttons that open and close the groups a level at a time. */
export const GroupingUiExpandCollapse = (props: IGroupingUiExpandCollapseProps) => {
    const styles = useMemo(() => getGroupingUiExpandCollapseStyles(), []);
    const components = { ...GroupingUiExpandCollapseComponents, ...props.components };

    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderExpandButton({
                title: props.expandTitle,
                disabled: !props.canExpand,
                styles: { root: styles.button },
                iconProps: { iconName: 'Add', styles: { root: styles.icon } },
                onClick: props.onExpand,
            })}
            {components.onRenderCollapseButton({
                title: props.collapseTitle,
                disabled: !props.canCollapse,
                styles: { root: styles.button },
                iconProps: { iconName: 'Remove', styles: { root: styles.icon } },
                onClick: props.onCollapse,
            })}
        </>,
    });
};
