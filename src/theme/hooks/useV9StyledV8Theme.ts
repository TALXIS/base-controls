import { useTheme } from "@fluentui/react"
import { createBrandVariants, createV8Theme, createV9Theme } from "@fluentui/react-migration-v8-v9";
import { useMemo } from "react";

/**
 * Returns a V9 styled V8 theme based on current theme settings.
 */
export const useV9StyledV8Theme = () => {
    const theme = useTheme();

    return useMemo(() => {
        const v9 = createV9Theme(theme);
        const brand = createBrandVariants(theme.palette);
        return createV8Theme(brand, v9);
    }, [theme.palette.themePrimary, theme.semanticColors.bodyText, theme.semanticColors.bodyBackground]);
}