import { ITheme, mergeStyleSets } from "@fluentui/react";
import { errorOpacityAnim, errorTransformAnim } from "@legacy/utilities/components/InputErrorMessage/styles";
import { borderAnim } from "@legacy/utilities/styles";

export const getComboBoxStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '.ms-ComboBox': {
                display: 'flex',
                paddingRight: 0,
                '.talxis-combobox__prefix-buttons': {
                    height: '100%'
                },
                '>div>div>div[class*="TALXIS__input-buttons__root"]': {
                    paddingRight: 9.5,
                    position: 'relative',
                    left: 1.5
                },
                ':has(>div>div>div[class*="TALXIS__input-buttons__root"])': {
                    '>div>div': {
                        height: '100%'
                    },
                    paddingLeft: 0
                },
            },
            '.ms-ComboBox-CaretDown-button': {
                width: 'initial',
                padding: 0,
                position: 'initial',
            },
            '&[class*="--underlined"] .ms-ComboBox': {
                paddingLeft: 8
            },
            '&[class*="--underlined"]:not([class*="has-error"]):focus-within .ms-ComboBox::after, &[class*="--underlined"]:not([class*="has-error"]) .is-open::after': {
                animation: `${borderAnim} 0.2s forwards`
            },
            '&[class*="--has-error"][class*="--has-error"], :has([role="alert"]:not(:empty))': {
                '.ms-ComboBox::after': {
                    borderColor: theme.semanticColors.errorText
                }
            },

            '&[class*="--underlined"] .ms-ComboBox::after': {
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderRadius: 0
            },
            '&[class*="--read-only"]:not([class*="--has-error"]):focus-within .ms-ComboBox::after': {
                borderColor: theme.semanticColors.disabledBorder
            },
            '>[role="alert"]': {
                animationName: `${errorOpacityAnim}, ${errorTransformAnim}`,
                animationDuration: '0.367s',
                animationTimingFunction: 'ease-in-out',
                animationFillMode: 'both',
                WebkitFontSmoothing: 'antialiased',
                fontSize: '12px',
                fontWeight: 400,
                color: theme.semanticColors.errorText,
                margin: 0,
                paddingTop: '5px',
                display: 'flex',
                alignItems: 'center'
            }
        },
        callout: {
            '.ms-Checkbox-label': {
                paddingLeft: 8,
                paddingRight: 8,
            },
            '.ms-Checkbox.ms-Checkbox': {
                paddingLeft: 0,
                paddingRight: 0,
                alignItems: 'stretch'
            }
        }
    })
}