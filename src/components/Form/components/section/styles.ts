import { ITheme, mergeStyleSets } from "@fluentui/react";
import type { ISectionProps } from "../..";
import { IColumnCalculation } from "../../layout/useCalculatedColumns";

interface ISectionStyleParams {
    section: ISectionProps;
    theme: ITheme;
}

const SECTION_LAYOUT_GAP = 10;

export const getSectionStyles = ({ section, theme }: ISectionStyleParams) => {
    return mergeStyleSets({
        section: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            borderRadius: 2,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: "hidden",
            margin: 6,
            boxShadow: theme.effects.elevation4,
            //used to cover up layout changes when resizing the section, so that the user doesn't see the layout change
            transition: 'opacity 0.2s ease-in-out 0.01s',
            '@starting-style': {
                opacity: 0
            },
            ...(section.visible === false ? { display: 'none' } : {})
        },
        header: {
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: theme.semanticColors.bodyBackgroundChecked,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
        },
        title: {
            fontSize: theme.fonts.medium.fontSize,
            fontFamily: theme.fonts.medium.fontFamily,
            fontWeight: 600,
            color: theme.semanticColors.bodyText,
            margin: 0,
        },
        body: {
            padding: 12,
            containerType: 'inline-size',
            gap: `${SECTION_LAYOUT_GAP}px`,
            opacity: 1,
        },
    });
};
