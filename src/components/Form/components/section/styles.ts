import { ITheme, mergeStyleSets } from "@fluentui/react";
import { ISection } from "../..";

export const getSectionStyles = (section: ISection, theme: ITheme) => {
    return mergeStyleSets({
        section: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            borderRadius: 2,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: "hidden",
            containerType: "inline-size",
            margin: 6,
            boxShadow: theme.effects.elevation4,
            ...(section.visible === false ? {display: 'none'} : {})
        },
        header: {
            display: "flex",
            alignItems: "center",
            padding: "8px 12px",
            //backgroundColor: theme.semanticColors.bodyBackgroundChecked,
            //borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
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
        },
    });
};
