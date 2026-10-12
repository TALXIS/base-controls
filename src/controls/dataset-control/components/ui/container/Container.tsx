import { useMemo } from "react";
import { getClassNames } from "@utils";
import { ContainerUiComponents, IContainerUiComponents } from "./components";
import { getContainerUiStyles } from "./styles";

export interface IContainerUiProps {
    children?: React.ReactNode;
    /** `'100%'` fills the parent; the content's height when left out. */
    height?: string;
    className?: string;
    components?: Partial<IContainerUiComponents>;
}

/** The control's box, stacking the header, body and footer. */
export const Container = (props: IContainerUiProps) => {
    const components = { ...ContainerUiComponents, ...props.components };
    const styles = useMemo(() => getContainerUiStyles(props.height), [props.height]);
    return components.onRenderContainer({ className: getClassNames([styles.datasetControlContainer, props.className]), children: props.children });
};
