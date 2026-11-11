import { useMemo } from "react";
import { getClassNames } from "@core";
import { DatasetControlUiBodyComponents, IDatasetControlUiBodyComponents } from "./components";
import { getDatasetControlUiBodyStyles } from "./styles";

/** Props for the body, as plain UI. */
export interface IDatasetControlUiBodyProps {
    /** What shows the records. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiBodyComponents>;
}

/** What fills the height the header and footer leave, usually the grid. */
export const DatasetControlUiBody = (props: IDatasetControlUiBodyProps) => {
    const components = { ...DatasetControlUiBodyComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiBodyStyles(), []);
    return components.onRender({ className: getClassNames([styles.datasetControlBody, props.className]), children: props.children });
};
