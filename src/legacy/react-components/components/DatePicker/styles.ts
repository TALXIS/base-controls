import { ITheme, mergeStyleSets } from "@fluentui/style-utilities";
import { borderAnim } from "../../utilities/styles";

export const getDatePickerStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '.ms-TextField-fieldGroup': {
                '> i[data-icon-name="Calendar"]': {
                    display: 'none'
                }
            },
            //keep the outline when calendar is opened
            '&:not([class*="has-error"]):not([class*="--underlined"]).is-open .ms-TextField-fieldGroup': {
                borderColor: theme.semanticColors.inputFocusBorderAlt,
                '::after': {
                    content: "''",
                    position: 'absolute',
                    inset: '-1px',
                    border: `2px solid ${theme.semanticColors.inputFocusBorderAlt}`,
                    borderRadius: '2px',
                    pointerEvents: 'none',
                }
            },
            //keep the outline when opened on error
            '&[class*="has-error"]:not([class*="--underlined"]).is-open .ms-TextField-fieldGroup': {
                borderColor: theme.semanticColors.errorText,
                '::after': {
                    content: "''",
                    position: 'absolute',
                    inset: '-1px',
                    border: `2px solid ${theme.semanticColors.errorText}`,
                    borderRadius: '2px',
                    pointerEvents: 'none',
                }
            },
            '&[class*="--underlined"]:focus-within .ms-TextField-wrapper, &[class*="--underlined"].is-open .ms-TextField-wrapper, &[class*="--underlined"]:focus-within .ms-TextField-fieldGroup, &.is-open[class*="--underlined"] .ms-TextField-fieldGroup': {
                borderBottomColor: 'transparent'
            },
            '&[class*="--underlined"] .ms-TextField-wrapper::after': {
                display: 'none'
            },
            '&[class*="--underlined"]:not([class*="has-error"]):focus-within .ms-TextField-fieldGroup::after, &[class*="--underlined"]:not([class*="has-error"]).is-open .ms-TextField-fieldGroup::after': {
                content: "''",
                position: 'absolute',
                inset: '-0px 0px',
                borderBottom: `2px solid ${theme.semanticColors.inputFocusBorderAlt}`,
                borderRadius: '0px',
                width: '100%',
                pointerEvents: 'none',
                animation: `${borderAnim} var(--animDuration, 0.2s) forwards`,
                top: -1
            },
            '&[class*="--underlined"][class*="has-error"]:focus-within .ms-TextField-fieldGroup::after, &[class*="--underlined"][class*="has-error"].is-open .ms-TextField-fieldGroup::after': {
                content: "''",
                position: 'absolute',
                inset: '-0px 0px',
                borderBottom: `2px solid ${theme.semanticColors.errorText}`,
                borderRadius: '0px',
                width: '100%',
                pointerEvents: 'none',
                animation: `${borderAnim} var(--animDuration, 0.2s) forwards`,
                top: -1
            },
            '&[class*="--underlined"] .ms-TextField-fieldGroup::after, &[class*="--underlined"] .ms-TextField-fieldGroup': {
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0
            },
            '&[class*="--read-only"]&[class*="--read-only"]:not([class*="--has-error"]) .ms-TextField-fieldGroup::after': {
                borderColor: theme.semanticColors.disabledBorder
            },
            '.ms-TextField-suffix, .ms-TextField-prefix': {
                padding: 0
            },
            '.is-disabled': {
                'i[data-icon-name="Calendar"]': {
                    backgroundColor: theme.semanticColors.buttonBackgroundDisabled,
                    color: theme.semanticColors.buttonTextDisabled
                }
            },
            '[class^="statusMessage"]:empty': {
                display: 'none'
            },
            ':has([class^="statusMessage"]:not(:empty))': {
                '.ms-TextField-wrapper::after': {
                    borderColor: theme.semanticColors.errorText
                }
            }
        }
    })
}