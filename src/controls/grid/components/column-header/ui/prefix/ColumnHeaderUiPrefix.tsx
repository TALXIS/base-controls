import { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { ColumnHeaderUiPrefixComponents, IColumnHeaderUiPrefixComponents } from "./components";
import { getColumnHeaderUiPrefixStyles } from "./styles";

export interface IColumnHeaderUiPrefixProps {
    /** Which edge the column reads from. */
    alignment?: IAlignment;
    /** Put on the container, alongside its own class. */
    className?: string;
    children?: React.ReactNode;
    components?: Partial<IColumnHeaderUiPrefixComponents>;
}

/** What a column header draws before what names it. */
export const ColumnHeaderUiPrefix = (props: IColumnHeaderUiPrefixProps) => {
    const { alignment = 'left' } = props;
    const components = { ...ColumnHeaderUiPrefixComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiPrefixStyles(alignment), [alignment]);

    return components.onRenderContainer({ className: getClassNames([styles.prefix, props.className]), children: props.children });
};
