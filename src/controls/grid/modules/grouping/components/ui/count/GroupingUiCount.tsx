import { useMemo } from "react";
import { IAlignment } from "@utils";
import { GroupingUiCountComponents, IGroupingUiCountComponents } from "./components";
import { getGroupingUiCountStyles } from "./styles";

export interface IGroupingUiCountProps {
    count: number;
    /** Which edge the cell's value reads from. */
    alignment?: IAlignment;
    components?: Partial<IGroupingUiCountComponents>;
}

/** How many records a group holds. */
export const GroupingUiCount = (props: IGroupingUiCountProps) => {
    const { alignment = 'left' } = props;
    const styles = useMemo(() => getGroupingUiCountStyles(alignment), [alignment]);
    const components = { ...GroupingUiCountComponents, ...props.components };

    return components.onRenderCount({ className: styles.count, children: `(${props.count})` });
};
