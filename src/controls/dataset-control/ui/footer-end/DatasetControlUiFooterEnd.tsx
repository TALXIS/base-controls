import { useMemo } from "react";
import { getClassNames } from "@core";
import { DatasetControlUiFooterEndComponents, IDatasetControlUiFooterEndComponents } from "./components";
import { getDatasetControlUiFooterEndStyles } from "./styles";

/** Props for the footer's end region, as plain UI. */
export interface IDatasetControlUiFooterEndProps {
    /** The parts drawn against the right. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiFooterEndComponents>;
}

/** The footer's right region, taking the rest of the row with its content against the right edge. */
export const DatasetControlUiFooterEnd = (props: IDatasetControlUiFooterEndProps) => {
    const components = { ...DatasetControlUiFooterEndComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiFooterEndStyles(), []);
    return components.onRender({ className: getClassNames([styles.datasetControlFooterEnd, props.className]), children: props.children });
};
