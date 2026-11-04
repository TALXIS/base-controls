import { useMemo } from "react";
import { getClassNames } from "@core";
import { INameCellUiComponents, NameCellUiComponents } from "./components";
import { getNameCellUiStyles } from "./styles";

export interface INameCellUiProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Strikes the name through. */
    isCompleted: boolean;
    components?: Partial<INameCellUiComponents>;
}

/** The box an item's name is drawn in, struck through once the item is finished; it replaces the value's own. */
export const NameCellUi = (props: INameCellUiProps) => {
    const { isCompleted, components: componentsProp, ...divProps } = props;
    const components = { ...NameCellUiComponents, ...componentsProp };
    const styles = useMemo(() => getNameCellUiStyles(), []);
    return components.onRenderContainer({ ...divProps, className: getClassNames([divProps.className, isCompleted ? styles.completed : undefined]) });
};
