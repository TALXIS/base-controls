import { ITheme, mergeStyleSets } from "@fluentui/react";
import { borderAnim } from "../../utilities/styles";

export const getTextFieldStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '.ms-TextField-suffix, .ms-TextField-prefix': {
                ':has([class*="TALXIS__input-buttons__root"])': {
                    padding: 0
                }
            },
            '&.ms-TextField--multiline, &.ms-TextField--multiline>.ms-TextField-wrapper, &.ms-TextField--multiline>.ms-TextField-wrapper>.ms-TextField-fieldGroup': {
                height: '100%'
            },
            '&[class*="--underlined"] .ms-TextField-fieldGroup::after, &[class*="--underlined"] .ms-TextField-fieldGroup': {
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0
            },
            '&[class*="--underlined"]:focus-within .ms-TextField-fieldGroup': {
                borderBottom: '1px solid transparent'
            },
            '&[class*="--underlined"]:not([class*="--has-error"]):focus-within .ms-TextField-fieldGroup::after': {
                content: "''",
                position: 'absolute',
                inset: '-0px 0px',
                borderBottom: `2px solid ${theme.semanticColors.inputFocusBorderAlt}`,
                borderRadius: '0px',
                width: '100%',
                pointerEvents: 'none',
                animation: `${borderAnim} 0.2s forwards`,
                bottom: -1
            },
            '&[class*="--read-only"]&[class*="--read-only"]:not([class*="--has-error"]) .ms-TextField-fieldGroup::after': {
                borderColor: theme.semanticColors.disabledBorder,
            }
        }
    })
}
