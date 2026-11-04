import { useTheme, ThemeContext, AppThemeContext } from "@theme";
import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";

import { PcfContext } from "@core/pcf/context/context";
import { GridServicesContext } from "../../../context";
import { GridCellContext, GridCellRevisionContext } from "../root/context";
import { GridFieldContext } from "../field/context";
import { GridControlContext } from "../column-control/context";
import { getNestedReactRootStyles } from "./styles";

export interface ICellNestedRootProps {
    children?: React.ReactNode;
}

/** Draws its children in their own React root so their handlers run ahead of AG Grid's. */
export const CellNestedRoot = (props: ICellNestedRootProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getNestedReactRootStyles(), []);
    const services = useContext(GridServicesContext);
    const cell = useContext(GridCellContext);
    const revision = useContext(GridCellRevisionContext);
    const field = useContext(GridFieldContext);
    const control = useContext(GridControlContext);
    const pcfContext = useContext(PcfContext);
    const theme = useTheme();
    const appTheme = useContext(AppThemeContext);

    //every render: the root holds the children this component was last given
    useLayoutEffect(() => {
        ReactDOM.render(
            <GridServicesContext.Provider value={services}>
                <PcfContext.Provider value={pcfContext}>
                    <GridCellContext.Provider value={cell}>
                        <GridCellRevisionContext.Provider value={revision}>
                            <GridFieldContext.Provider value={field}>
                                <GridControlContext.Provider value={control}>
                                    <AppThemeContext.Provider value={appTheme}>
                                        <ThemeContext theme={theme}>{props.children}</ThemeContext>
                                    </AppThemeContext.Provider>
                                </GridControlContext.Provider>
                            </GridFieldContext.Provider>
                        </GridCellRevisionContext.Provider>
                    </GridCellContext.Provider>
                </PcfContext.Provider>
            </GridServicesContext.Provider>,
            containerRef.current!);
    });

    //a layout cleanup runs while this element is still in the document
    useLayoutEffect(() => {
        return () => {
            ReactDOM.unmountComponentAtNode(containerRef.current!);
        };
    }, []);

    return <div ref={containerRef} className={styles.nestedReactRootContainer} />;
};
