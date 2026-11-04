import { Fragment } from "react";
import { useGridInternalService } from "../../useGridService";

/** What the modules draw over the grid, each deciding for itself whether to draw. */
export const Surfaces = () => {
    const surfaces = useGridInternalService('surfaces');

    return <>
        {surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
    </>;
};
