import { useEffect, useMemo, useState } from "react";
import { useControl, useControlTheme } from "../../hooks"
import { IGridContext } from "./core/interfaces/IGridContext";
import { Grid as GridModel } from "./core/model/Grid";
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
    const { labels } = useControl('Grid', props, gridTranslations);
    const keyHoldListener = useMemo(() => new KeyHoldListener(), []);
    const [isMounted, setIsMounted] = useState(true);
    const providerValue: IGridContext = useMemo(() => {
        return {
            gridInstance: new GridModel(props, labels, keyHoldListener)
        }
    }, [])
    
    providerValue.gridInstance.updateDependencies(props);
    const theme = useControlTheme(props.context.fluentDesignLanguage);

    useEffect(() => {
        return () => {
            keyHoldListener.destroy();
        }
    }, []);
    
    return (
        <div>
            <button onClick={() => setIsMounted(false)}>unmount</button>
            <button onClick={() => setIsMounted(true)}>mount</button>
        {isMounted &&
        <GridContext.Provider value={providerValue}>
            <ThemeProvider className={`talxis__gridControl ${styles.root}`} theme={theme} applyTo='none'>
                <AgGrid />
            </ThemeProvider>
        </GridContext.Provider>
        }
        </div>
    )
}