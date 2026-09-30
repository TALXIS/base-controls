import { useMemo } from "react";
import { ITextProps, useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { ColumnHeaderUiRequiredMarkerComponents, IColumnHeaderUiRequiredMarkerComponents } from "./components";
import { getColumnHeaderUiRequiredMarkerStyles } from "./styles";

export interface IColumnHeaderUiRequiredMarkerProps extends ITextProps {
    /** Whether the column asks for a value. Without one there is nothing to say. */
    isRequired?: boolean;
    components?: Partial<IColumnHeaderUiRequiredMarkerComponents>;
}

/** What says a column asks for a value. */
export const ColumnHeaderUiRequiredMarker = (props: IColumnHeaderUiRequiredMarkerProps) => {
    const { isRequired, className, components: _, ...textProps } = props;
    const components = { ...ColumnHeaderUiRequiredMarkerComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getColumnHeaderUiRequiredMarkerStyles(theme), [theme]);

    if (!isRequired) {
        return null;
    }
    return components.onRenderText({ ...textProps, className: getClassNames([styles.requiredMarker, className]), children: '*' });
};
