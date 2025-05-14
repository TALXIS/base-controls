import { mergeStyleSets } from "@fluentui/react"

export const getComboBoxStyles = (isColorFeatureEnabled: boolean, width?: number, height?: number) => {
    return mergeStyleSets({
        root: {
            height: height,
            width: width,
            display: 'flex',
            alignItems: 'center',
        },
        callout: {
            maxHeight: '300px !important',
            ...(isColorFeatureEnabled && {
                '.ms-Checkbox-label': {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '5px',
                    alignItems: 'center',
                },
            }),
        }
    })
}