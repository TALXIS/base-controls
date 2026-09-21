import { Fragment } from "react";
import { useGridService } from "../../useGridService";

/** What the modules draw over the grid, each of them saying for itself whether it draws anything. */
export const Surfaces = () => {
    const surfaces = useGridService('surfaces');

    return <>
        {surfaces.getSurfaces().map(surface => <Fragment key={surface.key}>{surface.onRender()}</Fragment>)}
    </>;
};
