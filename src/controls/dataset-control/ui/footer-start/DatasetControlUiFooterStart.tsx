import { useMemo } from "react";
import { getClassNames } from "@core";
import { DatasetControlUiFooterStartComponents, IDatasetControlUiFooterStartComponents } from "./components";
import { getDatasetControlUiFooterStartStyles } from "./styles";

/** Props for the footer's start region, as plain UI. */
export interface IDatasetControlUiFooterStartProps {
    /** The parts drawn against the left. */
    children?: React.ReactNode;
    /** Added to its box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiFooterStartComponents>;
}

/** The footer's left region, sized to what it holds. */
export const DatasetControlUiFooterStart = (props: IDatasetControlUiFooterStartProps) => {
    const components = { ...DatasetControlUiFooterStartComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiFooterStartStyles(), []);
    return components.onRender({ className: getClassNames([styles.datasetControlFooterStart, props.className]), children: props.children });
};
