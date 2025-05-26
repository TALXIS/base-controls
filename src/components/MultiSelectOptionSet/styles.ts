import { mergeStyleSets } from "@fluentui/react"

export const getComboBoxStyles = (isColorFeatureEnabled: boolean, isEmptyValue: boolean, width?: number, height?: number) => {
    return mergeStyleSets({
        root: {
            height: height,
            width: width,
            display: 'flex',
            alignItems: 'center',
            ...(!isEmptyValue && {
                paddingLeft: '4px !important',
            }),
            '.ms-ComboBox-Input': {
                opacity: isColorFeatureEnabled && !isEmptyValue ? 0 : 1,
                width: isColorFeatureEnabled && !isEmptyValue ? 0 : undefined
            }
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
        },
        colorfulOptionsWrapper: {
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
    })
}