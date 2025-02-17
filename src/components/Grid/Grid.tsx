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

export const Grid = (props: any) => {
    const [isMounted, setIsMounted] = useState(true);
    return <div>
        <button onClick={() => {
            //@ts-ignore - a
            props.parameters.Grid.destroy();
            setIsMounted(false);
        }}>unmount</button>
        <button onClick={() => setIsMounted(true)}>mount</button>
        {isMounted &&
            <Grid2 {...props} />
        }
    </div>
}

export const Grid2 = (props: IGrid) => {
    const { labels } = useControl('Grid', props, gridTranslations);
    const keyHoldListener = useMemo(() => new KeyHoldListener(), []);
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
        <GridContext.Provider value={providerValue}>
            <ThemeProvider className={`talxis__gridControl ${styles.root}`} theme={theme} applyTo='none'>
                <AgGrid />
            </ThemeProvider>
        </GridContext.Provider>

    )
}