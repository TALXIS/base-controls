import { DefaultButton, mergeStyleSets, MessageBarButton, PrimaryButton } from "@fluentui/react"
import { ButtonComponent } from "./withButtonLoading";

const getLeftPadding = (buttonComponent: ButtonComponent) => {
    switch(buttonComponent) {
        case DefaultButton:
        case PrimaryButton:
        case MessageBarButton: {
            return 5;
        }
    }
    return undefined;
}

export const getButtonWithLoadingStyles = (buttonComponent: ButtonComponent) => {
    return mergeStyleSets({
        root: {
            paddingLeft: getLeftPadding(buttonComponent),
            '.ms-Button-flexContainer': {
                gap: 5
            }
        },
        spinner: {
            '.ms-Spinner-circle': {
                height: 20,
                width: 20
            }
        }
    })
}