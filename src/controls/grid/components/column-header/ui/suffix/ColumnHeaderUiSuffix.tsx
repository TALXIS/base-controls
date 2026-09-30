import { useMemo } from "react";
import { ColumnHeaderUiSuffixComponents, IColumnHeaderUiSuffixComponents } from "./components";
import { getColumnHeaderSuffixStyles } from "./styles";

export interface IColumnHeaderUiSuffixProps {
    /** Whether what the column holds may be changed. */
    isEditable?: boolean;
    /** Drawn before the lock icon. */
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
            {isEditable === false && components.onRenderLockIcon({ iconName: 'Lock' })}
        </>,
    });
};
