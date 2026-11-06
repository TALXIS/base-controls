import { useMemo } from "react";
import { getClassNames } from "@core";
import { DatasetControlUiContainerComponents, IDatasetControlUiContainerComponents } from "./components";
import { getDatasetControlUiContainerStyles } from "./styles";

/** Props for the control's outer box, as plain UI. */
export interface IDatasetControlUiContainerProps {
    /** The skeleton, the error or the parts. */
    children?: React.ReactNode;
    /** `'100%'` fills the parent; the content's height when left out. */
    height?: string;
    /** Added to the box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IDatasetControlUiContainerComponents>;
}

/** The control's box, stacking the header, body and footer. */
export const DatasetControlUiContainer = (props: IDatasetControlUiContainerProps) => {
    const components = { ...DatasetControlUiContainerComponents, ...props.components };
    const styles = useMemo(() => getDatasetControlUiContainerStyles(props.height), [props.height]);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlContainer, props.className]), children: props.children });
};
