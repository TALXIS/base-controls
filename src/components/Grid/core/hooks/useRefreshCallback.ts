import { useEffect, useMemo } from "react";
import { GridDependency } from "../model/GridDependency";

export const useRefreshCallback = (model: GridDependency, refreshCallback: () => any) => {
    const id = useMemo(() => crypto.randomUUID(), [])
    useEffect(() => {
        model.addRefreshCallback(id, refreshCallback);
        console.log('refresh callback added')
        return () => {
            model.removeRefreshCallback(id);
        }
    }, []);
};