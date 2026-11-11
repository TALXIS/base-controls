import type { ReactNode } from "react";

/** The replaceable pieces of the map's box. */
export interface IMapUiContainerComponents {
    /** The box the adapter draws in. */
    onRender: (props: { className?: string; children: ReactNode }) => JSX.Element | null;
}

/** The defaults for {@link IMapUiContainerComponents}. */
export const MapUiContainerComponents: IMapUiContainerComponents = {
    onRender: props => <div className={props.className}>{props.children}</div>,
};
