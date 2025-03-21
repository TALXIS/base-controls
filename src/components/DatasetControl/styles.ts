import { mergeStyleSets } from "@fluentui/react"
import { Client } from "@talxis/client-libraries";
import { ITheme } from "@talxis/react-components";

const client = new Client();

export const getDatasetControlStyles = (theme: ITheme, height?: string | null) => {
    return mergeStyleSets({
        datasetControlRoot: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
            ...(height === '100%' ? getFullHeightStyles(theme) : {})

        },
        messageBarBtn: {
            minHeight: 'inherit'
        }
    });
}

const getFullHeightStyles = (theme: ITheme) => {
    const styles = {
        flexGrow: 1,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 15
    }
    if (!client.isTalxisPortal()) {
        return {
            ...styles,
            boxShadow: theme.effects.elevation8,
            borderRadius: theme.effects.roundedCorner4,
            margin: 16,
            marginRight: 20
        }
    }
    else {
        return styles;
    }
}