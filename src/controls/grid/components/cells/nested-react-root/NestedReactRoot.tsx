import { useContext, useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "@fluentui/react";
import { ThemeContext, useSurfaceTheme } from "@utils";
import { PcfContext } from "@utils/adapters/pcf-context/context";
import { GridServicesContext } from "../../../context";
import { GridCellContext, GridCellRevisionContext } from "../root/context";
import { GridFieldContext } from "../field/context";
import { GridControlContext } from "../control/context";
import { getNestedReactRootStyles } from "./styles";

export interface INestedReactRootProps {
    children?: React.ReactNode;
}

/**
 * Draws its children in a React root of their own, in an element of this one's.
 *
 * A root of its own is what puts the control's handlers ahead of AG Grid's: React listens on the root it
 * was given, so a key the control stops never reaches the cell. Nothing crosses into a root, so everything
 * the grid provides is handed over again inside it.
 */
export const NestedReactRoot = (props: INestedReactRootProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getNestedReactRootStyles(), []);
    const services = useContext(GridServicesContext);
    const cell = useContext(GridCellContext);
    const revision = useContext(GridCellRevisionContext);
    const field = useContext(GridFieldContext);
    const control = useContext(GridControlContext);
    const pcfContext = useContext(PcfContext);
    const theme = useTheme();
    const surfaceTheme = useSurfaceTheme();

    //every render, so the children the root holds are the ones this component was last given
    useLayoutEffect(() => {
        ReactDOM.render(
            <GridServicesContext.Provider value={services}>
                <PcfContext.Provider value={pcfContext}>
                    <GridCellContext.Provider value={cell}>
                        <GridCellRevisionContext.Provider value={revision}>
                            <GridFieldContext.Provider value={field}>
                                <GridControlContext.Provider value={control}>
                                    <ThemeContext theme={theme} surfaceTheme={surfaceTheme}>{props.children}</ThemeContext>
                                </GridControlContext.Provider>
                            </GridFieldContext.Provider>
                        </GridCellRevisionContext.Provider>
                    </GridCellContext.Provider>
                </PcfContext.Provider>
            </GridServicesContext.Provider>,
            containerRef.current!);
    });

    //a layout cleanup, because it runs while this element is still in the document
    useLayoutEffect(() => {
        return () => {
            ReactDOM.unmountComponentAtNode(containerRef.current!);
        };
    }, []);

    return <div ref={containerRef} className={styles.nestedReactRootContainer} />;
};
