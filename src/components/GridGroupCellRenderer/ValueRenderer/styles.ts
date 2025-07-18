import { ITheme, mergeStyleSets } from "@fluentui/react"
import { CSSProperties } from "react";

interface IDeps {
    theme: ITheme;
    isMultiline: boolean;
    makeBold: boolean;
}

export const getValueRendererStyles = (deps: IDeps) => {
    const { theme, isMultiline, makeBold } = deps;
    return mergeStyleSets({
        text: {
            fontSize: 'inherit',
            ...isMultiline ? getMultilineStyles() : {},
            ...makeBold ? {
                //fontWeight: 600
            } : {}
        },
        link: {
             ...isMultiline ? getMultilineStyles() : {},
        }
    })
}

const getMultilineStyles = (): CSSProperties => {
    return {
        whiteSpace: 'normal',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        //@ts-ignore
        wordBreak: 'auto-phrase',
        '-webkit-line-clamp': '6',
        lineHeight: 'normal'
    }
}