import { createContext, useContext } from "react";
import type { IPoint } from "@fluentui/react";
import type { IRecord } from "@talxis/client-libraries";
import type { ITaskDependency } from "../../../../../modules/dependencies";
import type { IGantt } from "../../../../interfaces";

/** The dependency a tooltip is drawn for. */
export interface ILinkTooltipContext {
    gantt: IGantt;
    dependency: ITaskDependency;
    predecessor?: IRecord;
    successor?: IRecord;
    /** Where the pointer is. */
    target: IPoint;
}

export const LinkTooltipContext = createContext<ILinkTooltipContext | undefined>(undefined);
LinkTooltipContext.displayName = 'LinkTooltip';

/** The dependency this tooltip is drawn for. */
export const useLinkTooltip = (): ILinkTooltipContext => {
    const context = useContext(LinkTooltipContext);
    if (!context) {
        throw new Error('This has to be drawn in the link tooltip, which createLinksModule draws for the hovered line.');
    }
    return context;
};
