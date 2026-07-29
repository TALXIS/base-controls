import { IDisabled, IErrorMessage, IReadOnly } from "../interfaces/components";
import { mergeStyles, useTheme } from "@fluentui/react";
import { useMemo } from "react";
import { ITheme } from "../utilities";


interface IComponentProps extends IReadOnly, IErrorMessage, IDisabled {
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
