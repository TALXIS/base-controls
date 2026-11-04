import React from "react";

export const useIsMounted = () => {
    const isMountedRef = React.useRef(true);
    
    React.useEffect(() => {
        //set on every setup, not only cleared on cleanup: StrictMode runs cleanup and setup a second time
        //on the *same* mount, keeping the fiber and its refs, so without this the simulated unmount leaves
        //`false` behind and the component reports itself gone for the rest of its life. A real remount
        //needs nothing - it builds a new ref, already `true`
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        }
    }, []);

    return () => isMountedRef.current;
}