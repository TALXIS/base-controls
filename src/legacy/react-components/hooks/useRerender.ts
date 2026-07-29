import { useEffect, useRef, useState } from "react"

export const useRerender = () => {
    const mountedRef = useRef(false);
    const [_, toggle] = useState<boolean>(false);

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
        toggle((prev) => !prev);
    }
}