import { useMemo } from "react";
import { ColumnHeaderUiSuffixComponents, IColumnHeaderUiSuffixComponents } from "./components";
import { getColumnHeaderUiSuffixStyles } from "./styles";

export interface IColumnHeaderUiSuffixProps {
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiSuffixComponents>;
}

/** What a column header draws after the name. */
export const ColumnHeaderUiSuffix = (props: IColumnHeaderUiSuffixProps) => {
    const { children } = props;
    const components = { ...ColumnHeaderUiSuffixComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiSuffixStyles(), []);

    return components.onRenderContainer({
        className: styles.suffixContainer,
        children: children,
    });
};
