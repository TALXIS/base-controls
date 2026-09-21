import { CSSProperties } from "react";
import { mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { getJustifyContent, IAlignment } from "@utils";

export const getGridValueRendererStyles = (columnAlignment: IAlignment, isMultiline: boolean) => {
    return mergeStyleSets({
        gridValueRendererRoot: {
            //fills whatever it is put in, so a wrapper can place it between a chevron and a count, or under
            //a label, and it still behaves as the value
            flex: 1,
            //8 off the edge, and the pixel the border of a control drawn in the cell's place takes
            paddingLeft: 9,
            paddingRight: 9,
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
