import { IComboBoxOption, ITheme } from "@fluentui/react";
import { ColorfulOption } from "@talxis/react-components";

export const onRenderColorfulOption = (options: ComponentFramework.PropertyHelper.OptionMetadata[], option: IComboBoxOption | undefined, theme: ITheme) => {
    if (!option) {
        return null;
    }
    const color = options.find(item => item.Value.toString() === option.key)?.Color ?? theme.palette.neutralLight
    return <ColorfulOption label={option.text} color={color} />
};

export const getIsColorFeatureEnabled = (enableColors: boolean | undefined, options: ComponentFramework.PropertyHelper.OptionMetadata[]) => {
    if (enableColors && options.find(x => x.Color)) {
        return true;
    }
    return false;
}