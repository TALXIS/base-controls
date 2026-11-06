import { Fragment } from "react";
import { useDatasetControlInternal } from "../root/context";

/** What the modules draw in the control, each deciding for itself whether to draw. */
export const Surfaces = () => {
    const surfaces = useDatasetControlInternal().services.get('surfaces');

    return <>
        {surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
    </>;
};
