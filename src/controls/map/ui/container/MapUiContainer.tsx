import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { IMapUiContainerComponents, MapUiContainerComponents } from "./components";
import { getMapUiContainerStyles } from "./styles";

export interface IMapUiContainerProps {
    /** A length; left out, it fills its parent. */
    height?: string;
    className?: string;
    children?: ReactNode;
    components?: Partial<IMapUiContainerComponents>;
}

/** The box that fills its parent, with the adapter that draws the map inside it. */
export const MapUiContainer = (props: IMapUiContainerProps) => {
    const components = { ...MapUiContainerComponents, ...props.components };
    const styles = useMemo(() => getMapUiContainerStyles(props.height), [props.height]);
    return components.onRenderContainer({ className: getClassNames([styles.container, props.className]), children: props.children });
};
