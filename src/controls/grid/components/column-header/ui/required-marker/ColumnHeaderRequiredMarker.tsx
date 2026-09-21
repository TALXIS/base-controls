import { useMemo } from "react";
import { ITextProps, Text, useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { getColumnHeaderRequiredMarkerStyles } from "./styles";

export interface IColumnHeaderRequiredMarkerProps extends ITextProps {
    /** Whether the column asks for a value. Without one there is nothing to say. */
    isRequired?: boolean;
}

/** What says a column asks for a value. */
export const ColumnHeaderRequiredMarker = (props: IColumnHeaderRequiredMarkerProps) => {
    const { isRequired, className, ...textProps } = props;
    const theme = useTheme();
    const styles = useMemo(() => getColumnHeaderRequiredMarkerStyles(theme), [theme]);

    if (!isRequired) {
        return null;
    }
    return <Text {...textProps} className={getClassNames([styles.requiredMarker, className])}>*</Text>;
};
