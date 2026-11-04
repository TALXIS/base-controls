import { mergeStyleSets } from "@fluentui/react"

export const getControlStyles = () => {
    return mergeStyleSets({
        control: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            gap: 5
        }
    });
}