import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ChecklistProgressComponents, IChecklistProgressComponents } from "./components";
import { getChecklistProgressStyles } from "./styles";

export interface IChecklistProgressProps {
    completedCount: number;
    totalCount: number;
    components?: Partial<IChecklistProgressComponents>;
}

/** How far a checklist has got, as `done/total`. */
export const ChecklistProgress = (props: IChecklistProgressProps) => {
    const { completedCount, totalCount } = props;
    const components = { ...ChecklistProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getChecklistProgressStyles(theme), [theme]);

    if (totalCount === 0) {
        return null;
    }
    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderIcon({ iconName: 'Completed', className: completedCount === totalCount ? styles.completedIcon : styles.icon })}
            {components.onRenderText({ children: `${completedCount}/${totalCount}` })}
        </>,
    });
};
