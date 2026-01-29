import React, { useEffect } from "react";

export const useShouldRemount = (): [boolean, () => void] => {
    const [shouldRemount, setShouldRemount] = React.useState(false);

    useEffect(() => {
        if(shouldRemount) {
            setShouldRemount(false);
        }
    }, [shouldRemount]);

    return [shouldRemount, () => setShouldRemount(true)];;
}