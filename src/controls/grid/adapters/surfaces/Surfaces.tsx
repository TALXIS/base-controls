import { Fragment } from "react";
import { useGridServiceInternal } from "../../useGridService";

/** What the modules draw over the grid, each deciding for itself whether to draw. */
export const Surfaces = () => {
    const surfaces = useGridServiceInternal('surfaces');

    return <>
        {surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
    </>;
};
