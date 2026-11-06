import { useMemo } from "react";
import { getClassNames } from "@core";
import { IChecklistUiNameCellComponents, ChecklistUiNameCellComponents } from "./components";
import { getChecklistUiNameCellStyles } from "./styles";

export interface IChecklistUiNameCellProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Strikes the name through. */
    isCompleted: boolean;
    components?: Partial<IChecklistUiNameCellComponents>;
}

/** The box an item's name is drawn in, struck through once the item is finished; it replaces the value's own. */
export const ChecklistUiNameCell = (props: IChecklistUiNameCellProps) => {
    const { isCompleted, components: componentsProp, ...divProps } = props;
    const components = { ...ChecklistUiNameCellComponents, ...componentsProp };
    const styles = useMemo(() => getChecklistUiNameCellStyles(), []);
    return components.onRenderContainer({ ...divProps, className: getClassNames([divProps.className, isCompleted ? styles.completed : undefined]) });
};
