import React from "react";

export const useIsMounted = () => {
    const isMountedRef = React.useRef(true);
    
    React.useEffect(() => {
        return () => {
            isMountedRef.current = false;
        }
    }, []);

    return () => isMountedRef.current;
}