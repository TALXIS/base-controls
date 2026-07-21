import { mergeStyleSets } from "@fluentui/react";

export const FLEX_STYLES = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
}

export const getFormStyles = () => {
    return mergeStyleSets({
        form: {
            ...FLEX_STYLES,
            gap: 12,
        }
    })
}