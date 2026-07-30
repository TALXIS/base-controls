import { useEffect, useRef, useState } from "react"

export const useRerender = () => {
    const mountedRef = useRef(false);
    const [, setRenderToken] = useState(() => Symbol("render"));

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        }
    }, []);

    return () => {
        if(!mountedRef.current) {
            return;
        }
        setRenderToken(Symbol("render"));
    }
}