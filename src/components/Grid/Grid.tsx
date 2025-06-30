import { useEffect, useMemo } from "react";
import { useControl, useControlTheme } from "../../hooks"
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid2, Grid as GridModel } from "./core/model/Grid";
import { IGrid } from "./interfaces";
import { AgGrid } from './core/components/AgGrid/AgGrid';
import { gridTranslations } from './translations';
import { GridContext } from "./GridContext";
import { mergeStyleSets, ThemeProvider } from "@fluentui/react";
import { KeyHoldListener } from "./core/services/KeyListener";

const styles = mergeStyleSets({
    root: {
        displayName: 'talxis__gridControl',
        height: '100%'
    }
});


export const Grid = (props: IGrid) => {
    const { labels, theme } = useControl('Grid', props, gridTranslations);
    const keyHoldListener = useMemo(() => new KeyHoldListener(), []);
    const providerValue: IGridContext = useMemo(() => {
        return {
            gridInstance: new Grid2({
                labels: labels,
                onGetProps: () => props,
                theme: theme
            }) as any
        }
    }, [])

    //providerValue.gridInstance.updateDependencies(props);

    useEffect(() => {
        return () => {
            providerValue.gridInstance.destroy();
        }
    }, []);

    return (
        <GridContext.Provider value={providerValue}>
            <ThemeProvider className={`talxis__gridControl ${styles.root}`} theme={theme} applyTo='none'>
                <AgGrid {...props} />
            </ThemeProvider>
        </GridContext.Provider>

    )
}