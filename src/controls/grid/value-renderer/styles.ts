import { CSSProperties } from "react";
import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";

export const getGridValueRendererStyles = (columnAlignment: IAlignment, isMultiline: boolean) => {
    return mergeStyleSets({
        gridValueRendererRoot: {
            //fills whatever it is put in
            flex: 1,
            //8 off the edge plus the pixel an editor control's border takes
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

/** How a value that runs past one line is drawn: wrapped and clamped. */
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
