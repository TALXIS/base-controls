import { useEffect, useRef, useState } from "react"

export interface IRerender {
    /** Asks for another render. */
    rerender: () => void;
    /** A new symbol on each render asked for. */
    revision: symbol;
}

export const useRerender = (): IRerender => {
    const mountedRef = useRef(false);
    const [revision, setRevision] = useState(() => Symbol('revision'));

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        }
    }, []);

    const rerender = () => {
        if (!mountedRef.current) {
            return;
        }
        setRevision(Symbol('revision'));
    };
    return { rerender, revision };
}
