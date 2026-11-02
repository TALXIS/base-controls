import { GANTT_LINK_DENY_CLASS, GANTT_LINK_TOOLTIP_CLASS } from "../../chart";
import { LINK_DRAG_TYPE_CLASS } from "./classNames";

/** One end of a link being drawn: its task's name and the edge it attaches to. */
export interface IDragLinkTooltipEnd {
    text: string;
    edge: string;
}

export interface IDragLinkTooltipDrop {
    /** The dependency type the link would be. */
    type: string;
    target: IDragLinkTooltipEnd;
}

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => `&#${character.charCodeAt(0)};`);

const getEndHtml = (end: IDragLinkTooltipEnd): string => `<b>${escapeHtml(end.text)}</b>${escapeHtml(end.edge)}`;

export const getDragLinkTooltipHtml = (source: IDragLinkTooltipEnd, drop?: IDragLinkTooltipDrop): string => {
    if (!drop) {
        return getEndHtml(source);
    }
    return `<div class="${LINK_DRAG_TYPE_CLASS}">${escapeHtml(drop.type)}</div>${getEndHtml(source)} → ${getEndHtml(drop.target)}`;
};

export const getDragLinkTooltipClass = (isDenied: boolean): string => isDenied ? `${GANTT_LINK_TOOLTIP_CLASS} ${GANTT_LINK_DENY_CLASS}` : GANTT_LINK_TOOLTIP_CLASS;
