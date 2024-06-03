import { useEffect, useMemo } from "react";
import { GridDependency } from "../model/GridDependency";

export const useRefreshCallback = (model: GridDependency | Promise<GridDependency>, refreshCallback: () => any) => {
    const id = useMemo(() => crypto.randomUUID(), [])
    useEffect(() => {
        (async () => {
            const _model = await model;
            _model.addRefreshCallback(id, refreshCallback);
        })();
        return () => {
            (async () => {
                const _model = await model;
                _model.removeRefreshCallback(id);
                
            })();
        }
    }, []);
};