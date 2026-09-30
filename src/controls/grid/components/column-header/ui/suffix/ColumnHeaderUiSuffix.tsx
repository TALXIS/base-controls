import { useMemo } from "react";
import { ColumnHeaderUiSuffixComponents, IColumnHeaderUiSuffixComponents } from "./components";
import { getColumnHeaderUiSuffixStyles } from "./styles";

export interface IColumnHeaderUiSuffixProps {
    /** Whether what the column holds may be changed. */
    isEditable?: boolean;
    /** Why the column cannot be changed, shown on the lock. */
    lockMessage?: string;
    /** Drawn before the lock icon. */
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

/** What a column header draws after the name. */
export const ColumnHeaderUiSuffix = (props: IColumnHeaderUiSuffixProps) => {
    const { isEditable, children } = props;
    const components = { ...ColumnHeaderUiSuffixComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiSuffixStyles(), []);

    return components.onRenderContainer({
        className: styles.suffixContainer,
        children: <>
            {children}
            {isEditable === false && components.onRenderLockIcon({ message: props.lockMessage })}
        </>,
    });
};
