import { Fragment } from "react";
import { useGridService } from "../../useGridService";

/** What the modules draw over the grid, each deciding for itself whether to draw. */
export const Surfaces = () => {
    const surfaces = useGridService('surfaces');

    return <>
        {surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
    </>;
};
