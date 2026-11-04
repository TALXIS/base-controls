import { Fragment } from "react";
import { IColumnHeaderAdornment } from "../../runtime/column-header";

/** What the modules drew, in the order they were asked. */
export const renderAdornments = (adornments: IColumnHeaderAdornment[]): JSX.Element => {
    return <>
        {adornments.map(adornment => <Fragment key={adornment.key}>{adornment.onRender?.()}</Fragment>)}
    </>;
};
