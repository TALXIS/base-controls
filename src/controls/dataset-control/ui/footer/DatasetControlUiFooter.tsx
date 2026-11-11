import { useTheme } from "@theme";
import { useMemo } from "react";

import { getClassNames } from "@core";
import { DatasetControlUiFooterComponents, IDatasetControlUiFooterComponents } from "./components";
import { getDatasetControlUiFooterStyles } from "./styles";

/** Props for the footer, as plain UI. */
export interface IDatasetControlUiFooterProps {
    /** The start and end regions. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiFooterComponents>;
}

/** The row below the records, holding the paging and the record count. */
export const DatasetControlUiFooter = (props: IDatasetControlUiFooterProps) => {
    const components = { ...DatasetControlUiFooterComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getDatasetControlUiFooterStyles(theme), [theme]);
    return components.onRender({ className: getClassNames([styles.datasetControlFooter, props.className]), children: props.children });
};
