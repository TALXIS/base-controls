import { ITheme, mergeStyleSets } from "@fluentui/react";
import { ISection } from "../..";
import { IColumnCalculation } from "../../layout/useCalculatedColumns";

interface ISectionStyleParams {
    section: ISection;
    theme: ITheme;
    columnCalculation: IColumnCalculation;
}

const SECTION_LAYOUT_GAP = 10;

export const getSectionStyles = ({ section, theme, columnCalculation }: ISectionStyleParams) => {
    const { numberOfColumns, firstRender } = columnCalculation;
    return mergeStyleSets({
        section: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            borderRadius: 2,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: "hidden",
            margin: 6,
            boxShadow: theme.effects.elevation4,
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
            display: 'grid',
            opacity: firstRender ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out 0.5s',
            containerType: 'inline-size',
            gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)`,
            gap: `${SECTION_LAYOUT_GAP}px`,
        },
    });
};
