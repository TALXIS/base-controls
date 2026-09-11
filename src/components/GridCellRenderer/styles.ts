import { CSSProperties } from "react";
import { mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { getJustifyContent, IAlignment } from "@utils";

export const getGridCellRendererStyles = (columnAlignment: IAlignment, isMultiline: boolean) => {
    return mergeStyleSets({
        gridCellRendererRoot: {
            //fills whatever it is put in and carries nothing of its own, so a wrapper can place it between
            //a chevron and a count, or under a label, and it still behaves as the value
            flex: 1,
            display: 'flex',
            alignItems: isMultiline ? 'flex-start' : 'center',
            justifyContent: getJustifyContent(columnAlignment),
            gap: 5,
            minWidth: 0,
            overflow: 'hidden',
        },
    });
};

/** How a value that runs past one line is drawn: wrapped, and clamped rather than growing without end. */
export const getMultilineStyles = (): CSSProperties => {
    return {
        whiteSpace: 'normal',
        display: '-webkit-box',
        //@ts-ignore - vendor properties the typings do not carry
        '-webkit-box-orient': 'vertical',
        //@ts-ignore
        wordBreak: 'auto-phrase',
        '-webkit-line-clamp': '6',
        lineHeight: 'normal',
    };
};
