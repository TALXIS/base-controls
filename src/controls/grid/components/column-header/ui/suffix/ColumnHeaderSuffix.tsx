import { useMemo } from "react";
import { ColumnHeaderSuffixComponents, IColumnHeaderSuffixComponents } from "./components";
import { getColumnHeaderSuffixStyles } from "./styles";

export interface IColumnHeaderSuffixProps {
    /** Whether what the column holds may be changed, which is what the icon says. */
    isEditable?: boolean;
    /** Drawn before the uneditable icon. */
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderSuffixComponents>;
}

/** What a column header draws after the name. */
export const ColumnHeaderSuffix = (props: IColumnHeaderSuffixProps) => {
    const { isEditable, children } = props;
    const components = { ...ColumnHeaderSuffixComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderSuffixStyles(), []);

    return components.onRenderContainer({
        className: styles.suffixContainer,
        children: <>
            {children}
            {isEditable === false && components.onRenderUneditableIcon({ iconName: 'Uneditable' })}
        </>,
    });
};
