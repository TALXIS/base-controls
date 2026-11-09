import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@legacy";

export const getMapProviderPickerStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: 180,
            '.ms-Dropdown-title': {
                boxShadow: theme.effects.elevation8
            }
        }
    });
};
