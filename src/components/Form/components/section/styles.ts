import { ITheme, mergeStyleSets } from "@fluentui/react";
import { ISectionProps } from "./Section";

interface ISectionStyleParams {
    section: ISectionProps;
    theme: ITheme;
}

const SECTION_LAYOUT_GAP = 10;

export const getSectionStyles = ({ section, theme }: ISectionStyleParams) => {
    return mergeStyleSets({
        section: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: "hidden",
            boxShadow: theme.effects.elevation4,
            opacity: 1,
            transform: "translateY(0)",
            transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out 0.01s",
            '@starting-style': {
                opacity: 0,
                transform: "translateY(-16px)"
            },
            ...(section.visible === false ? { display: 'none' } : {})
        },
        header: {
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: theme.palette.neutralLighterAlt,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
        },
        title: {
            fontSize: theme.fonts.medium.fontSize,
            fontFamily: theme.fonts.medium.fontFamily,
            fontWeight: 600,
            //textTransform: "uppercase",
            color: theme.semanticColors.bodyText,
        },
        body: {
            padding: 12,
            containerType: 'inline-size',
            gap: `${SECTION_LAYOUT_GAP}px`,
        },
    });
};
