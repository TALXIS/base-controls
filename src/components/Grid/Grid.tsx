import { useMemo } from "react";
import { useControl, useControlTheme } from "../../hooks"
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid as GridModel } from "./core/model/Grid";
import { IGrid } from "./interfaces";
import { AgGrid } from './core/components/AgGrid/AgGrid';
import React from 'react';
import { gridTranslations } from './translations';
import { GridContext } from "./GridContext";
import { mergeStyleSets, ThemeProvider } from "@fluentui/react";

const styles = mergeStyleSets({
    root: {
        displayName: 'talxis__gridControl',
        height: '100%'
    }
});

export const Grid = (props: IGrid) => {
    const { labels } = useControl('Grid', props, gridTranslations);
    const providerValue: IGridContext = useMemo(() => {
        return {
            gridInstance: new GridModel(props, labels)
        }
    }, [])
    providerValue.gridInstance.updateDependencies(props);
    const theme = useControlTheme(props.context.fluentDesignLanguage);
    return (
        <GridContext.Provider value={providerValue}>
            <ThemeProvider className={`talxis__gridControl ${styles.root}`} theme={theme} applyTo='none'>
                <AgGrid />
            </ThemeProvider>
        </GridContext.Provider>
    )
}