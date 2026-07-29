import { ContextualMenuItemType } from "@fluentui/react";
import { ITheme, mergeStyles } from "@fluentui/react";
import { IAutoCompleteItemProps } from "./Autocomplete";

export const getAutocompleteStyles = () => {
    return mergeStyles({
        '[class*="TALXIS__autocomplete__search-btn"][class*="--hover-only"]': {
            display: "none"
        },
        '[class^="TALXIS__autocomplete__root"] .ms-TextField:hover [class*="TALXIS__autocomplete__search-btn"][class*="--hover-only"]': {
            display: "block"
        }
    });
};

export const getCalloutStyles = (theme: ITheme, suggestionsContainerWidth?: number | string) => {
    return mergeStyles({
        width: suggestionsContainerWidth || 300,
        ".TALXIS__autocomplete__callout__item--selected": {
            background: theme.semanticColors.buttonBackgroundHovered
        },
        ".TALXIS__autocomplete__callout__loading": {
            margin: "5px",
            paddingTop: '10px',
            textAlign: "center"
        },
        ".TALXIS__autocomplete__callout__not-found-text": {
            textAlign: "center",
            display: "block",
            margin: "5px",
            color: "grey"
        },
        ".TALXIS__autocomplete__callout__error-text": {
            textAlign: "center",
            display: "block",
            margin: "5px",
            color: theme.semanticColors.errorText
        },
        '.TALXIS__autocomplete__callout__loading > span': {
            color: theme.palette.themePrimary
        }
    });
}
export const getSuggestionsContainerStyles = (theme: ITheme, suggestionRowHeight?: number | string) => {
    return mergeStyles({
        overflowX: "hidden !important",
        ".ms-Button--commandBar .ms-Button-label": {
            fontWeight: 400
        },
        ".TALXIS__command-bar .ms-CommandBar": {
            paddingLeft: "5px",
            paddingRight: "5px",
            backgroundColor: "transparent"
        },
        ".ms-Button--commandBar": {
            backgroundColor: "transparent"
        },
        ".ms-CommandBar-primaryCommand": {
            display: "none"
        },
        ".ms-CommandBar-secondaryCommand": {
            width: "100%"
        },
        ".ms-TooltipHost .ms-OverflowSet-item:first-child .ms-Button--commandBar": {
            textAlign: "left"
        },
        ".ms-CommandBar-secondaryCommand .ms-OverflowSet-item:first-child": {
            flexGrow: 1,
            flexShrink: 1,
            minWidth: "0"
        },
        "> div > div:first-child": {
            borderTop: 'none'
        },
        '.ms-CommandBar': {
            height: suggestionRowHeight
        },
        ".TALXIS__autocomplete__suggestion__inner-content": {
            overflow: "hidden"
        },
        '.TALXIS__autocomplete__suggestion__non-selectable': {
            pointerEvents: 'none'
        },
        '.TALXIS__autocomplete__suggestion__non-selectable > .TALXIS__autocomplete__suggestion__non-selectable__header': {
            paddingLeft: 9,
            fontWeight: 600,
            color: theme.palette.themePrimary,
            position: 'relative',
            top: 10
        },
        ".TALXIS__autocomplete__suggestion__inner-content > span": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
        },
    });
}
export const getItemContainerStyles = (suggestion: IAutoCompleteItemProps, theme: ITheme): string | undefined => {
    if (suggestion.itemType === ContextualMenuItemType.Header) {
        return mergeStyles({
            pointerEvents: 'none',
            borderTop: `1px solid ${theme.semanticColors.menuDivider}`
        })
    }
    return mergeStyles({
        ':hover': {
            cursor: "pointer",
            background: theme.semanticColors.buttonBackgroundHovered
        }
    });
}

