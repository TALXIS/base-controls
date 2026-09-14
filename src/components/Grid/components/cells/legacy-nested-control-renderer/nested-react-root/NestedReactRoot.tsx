import { useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { getNestedReactRootStyles } from "./styles";

export interface INestedReactRootProps {
    children?: React.ReactNode;
}

/**
 * Draws its children in a React root of their own, in an element of this one's.
 *
 * React attaches its listeners to a root's own container, so a handler inside these children runs while the
 * event is still below the grid - which is what lets a control keep a key AG Grid would otherwise take
 * first. Nothing of the surrounding React context crosses the boundary: a child reads what it is handed.
 */
export const NestedReactRoot = (props: INestedReactRootProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getNestedReactRootStyles(), []);

    //every render, so the children the root holds are the ones this component was last given
    useLayoutEffect(() => {
        ReactDOM.render(<>{props.children}</>, containerRef.current!);
    });

    //a layout cleanup, because it runs while this element is still in the document: a legacy root torn
    //down from a passive one is torn down after the commit, which the grid has already removed the cell in
    useLayoutEffect(() => {
        return () => {
            ReactDOM.unmountComponentAtNode(containerRef.current!);
        };
    }, []);

    return <div ref={containerRef} className={styles.nestedReactRootContainer} />;
};
