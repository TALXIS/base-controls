import { IDisabled, IErrorMessage, IFillAvailableSpace, IReadOnly } from "../interfaces/components";
import { mergeStyles, useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { ITheme } from "../utilities";


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
        result += ` ${useMemo(() => getHideErrorMessageStyles(), [])}`
    }
    if(componentProps.fillAvailableSpace) {
        result += ` ${useMemo(() => getFillAvailableSpaceStyles(), [])}`
    }
    result += ` ${useMemo(() => getHoverOnlyStyle(), [])}`
    return result;
};

const getHideErrorMessageStyles = () => {
    return mergeStyles({
        '.ms-TextField-errorMessage, &.ms-ComboBox-container > [id*="-error"], .TALXIS__errorMessage': {
            display: 'none'
        }
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
            height: '100%'
        },
        '&.ms-ComboBox-container .ms-ComboBox, .ms-BasePicker-text': {
            height: '100%'
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
