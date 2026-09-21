import { useMemo } from "react";
import { ColumnHeaderUiSuffixComponents, IColumnHeaderUiSuffixComponents } from "./components";
import { getColumnHeaderSuffixStyles } from "./styles";

export interface IColumnHeaderUiSuffixProps {
    /** Whether what the column holds may be changed, which is what the icon says. */
    isEditable?: boolean;
    /** Drawn before the uneditable icon. */
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

/** What a column header draws after the name. */
export const ColumnHeaderUiSuffix = (props: IColumnHeaderUiSuffixProps) => {
    const { isEditable, children } = props;
    const components = { ...ColumnHeaderUiSuffixComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderSuffixStyles(), []);

    return components.onRenderContainer({
        className: styles.suffixContainer,
        children: <>
            {children}
            {isEditable === false && components.onRenderUneditableIcon({ iconName: 'Uneditable' })}
        </>,
    });
};
