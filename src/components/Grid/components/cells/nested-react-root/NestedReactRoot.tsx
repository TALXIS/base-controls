import { useLayoutEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { getNestedReactRootStyles } from "./styles";

export interface INestedReactRootProps {
    children?: React.ReactNode;
}

/** Draws its children in a React root of their own, in an element of this one's. */
export const NestedReactRoot = (props: INestedReactRootProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const styles = useMemo(() => getNestedReactRootStyles(), []);

    //every render, so the children the root holds are the ones this component was last given
    useLayoutEffect(() => {
        ReactDOM.render(<>{props.children}</>, containerRef.current!);
    });

    //a layout cleanup, because it runs while this element is still in the document
    useLayoutEffect(() => {
        return () => {
            ReactDOM.unmountComponentAtNode(containerRef.current!);
        };
    }, []);

    return <div ref={containerRef} className={styles.nestedReactRootContainer} />;
};
