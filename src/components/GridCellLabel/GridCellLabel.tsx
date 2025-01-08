import { Link, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { IGridCellLabel } from "./interfaces";
import { Text } from '@fluentui/react';
import { useMemo } from "react";
import { getGridCellLabelStyles } from "./styles";

export const GridCellLabel = (props: IGridCellLabel) => {
    const { theme } = useControl('GridCellLabel', props);
    const styles = useMemo(() => getGridCellLabelStyles(), []);

    const renderContent = () => {
        const formattedText = props.parameters.value.formatted ?? props.parameters.value.raw;
        if(props.parameters.RenderAsLink?.raw) {
            return <Link href={props.parameters.Url!.raw!} className={styles.content}>{formattedText}</Link>
        }
        return <Text className={styles.content}>{props.parameters.value.formatted}</Text>
    }

    return <ThemeProvider className={styles.root} theme={theme}>
        {renderContent()}
    </ThemeProvider>
}
