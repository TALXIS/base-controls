import { mergeStyleSets } from "@fluentui/react"

export const getMultiValueContainerStyles = (isDisabled: boolean) => {
    return mergeStyleSets({
        root: {
            '&&': {
                ...(isDisabled ? {
                    border: 'none',
                    padding: '0px',
                    backgroundColor: 'transparent',
                } : {})
            }
        }
    })
}
