import { useMemo } from "react";
import { getClassNames } from "@utils";
import { ContainerUiComponents, IContainerUiComponents } from "./components";
import { getContainerUiStyles } from "./styles";

/** Props for the control's outer box, as plain UI. */
export interface IContainerUiProps {
    /** The skeleton, the error or the parts. */
    children?: React.ReactNode;
    /** `'100%'` fills the parent; the content's height when left out. */
    height?: string;
    /** Added to the box. */
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IContainerUiComponents>;
}

/** The control's box, stacking the header, body and footer. */
export const Container = (props: IContainerUiProps) => {
    const components = { ...ContainerUiComponents, ...props.components };
    const styles = useMemo(() => getContainerUiStyles(props.height), [props.height]);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlContainer, props.className]), children: props.children });
};
