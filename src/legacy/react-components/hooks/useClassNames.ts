import { IDisabled, IErrorMessage, IFillAvailableSpace, IReadOnly } from "../interfaces/components";
import { mergeStyles, useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { ITheme } from "@theme";


interface IComponentProps extends IReadOnly, IErrorMessage, IDisabled, IFillAvailableSpace {
    className?: string;
    [key: string]: any;
}

export const useClassNames = (componentName: string, componentProps: IComponentProps, additionalParameters?: string[], additionalClassNames?: string[]) => {
    const theme: ITheme = useTheme();
    const { errorMessage, className, readOnly } = { ...componentProps };
    let result = `TALXIS__${componentName.toLowerCase()}__root`;
    if (errorMessage) {
        result += '--has-error'
    }
    if (readOnly) {
        result += '--read-only';
    }
    if (theme.effects?.underlined) {
        result += '--underlined'
    }
    if (componentProps.disabled) {
        result += '--disabled'
    }
    additionalParameters?.map(par => {
        result += par
    });
    if (className) {
        result += ` ${componentProps.className}`;
    }
    additionalClassNames?.map(className => {
        result += ` ${className}`
    })
    if(componentProps.hideErrorMessage) {
        result += ` ${useMemo(() => getHideErrorMessageStyles(theme), [theme])}`
    }
    if(componentProps.fillAvailableSpace) {
        result += ` ${useMemo(() => getFillAvailableSpaceStyles(), [])}`
    }
    result += ` ${useMemo(() => getHoverOnlyStyle(), [])}`
    return result;
};

//Fluent marks an error only by drawing the border in `errorText`, so the border takes its own colours back
const getHideErrorMessageStyles = (theme: ITheme) => {
    const { inputBorder, inputBorderHovered, inputFocusBorderAlt } = theme.semanticColors;
    return mergeStyles({
        '.ms-TextField-errorMessage, &.ms-ComboBox-container > [id*="-error"], .TALXIS__errorMessage': {
            display: 'none'
        },
        '.ms-TextField-fieldGroup': {
            borderColor: inputBorder,
        },
        '.ms-TextField-fieldGroup:hover': {
            borderColor: inputBorderHovered,
        },
        '.ms-TextField-fieldGroup::after': {
            borderColor: inputFocusBorderAlt,
        },
        //a focused combo box draws its focus border instead
        '&.ms-ComboBox-container .ms-ComboBox:not(:focus-within)::after': {
            borderColor: inputBorder,
        },
        '&.ms-ComboBox-container .ms-ComboBox:not(:focus-within):hover::after': {
            borderColor: inputBorderHovered,
        },
    });
}

/**
 * What it takes for a component to be the height of its container.
 *
 * Every element between the root and the one carrying the border, for each component this hook names: a
 * height on the root alone stops at the first of them that sizes itself.
 */
const getFillAvailableSpaceStyles = () => {
    return mergeStyles({
        height: '100%',
        //the text field, and the one a date picker draws inside its own wrapper
        '.ms-TextField, .ms-TextField-wrapper, .ms-TextField-fieldGroup, >div, >div>.ms-TextField': {
            height: '100%',
            //a multiline field keeps a minimum for the rows it was asked for, which is taller than the
            //space a cell of the grid has to give it
            minHeight: 0
        },
        '&.ms-ComboBox-container .ms-ComboBox, .ms-BasePicker-text': {
            height: '100%'
        },
        //a multiline field asks for the height its rows need, which is taller than the space it was given
        '&.ms-TextField--multiline .ms-TextField-field, .ms-TextField--multiline .ms-TextField-field': {
            height: '100%',
            minHeight: 0,
            //its padding is inside the height it was given, which is all there is
            boxSizing: 'border-box'
        },
    });
}

const getHoverOnlyStyle = () => {
    return mergeStyles({
        '.hover-only': {
            display: 'none'
        },
        "@media (pointer: coarse)": {
            '.hover-only': {
                display: 'block'
            }
        },
        ':hover': {
            '.hover-only': {
                display: 'block'
            }
        }
    })
}
