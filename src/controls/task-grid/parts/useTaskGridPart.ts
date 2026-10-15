import { useEffect, useState } from "react";
import { useDatasetControl } from "@controls/dataset-control";
import type { ITaskGrid } from "../runtime";

//the header's parts render before the body registers the task grid
export const useTaskGridPart = (): ITaskGrid | undefined => {
    const control = useDatasetControl();
    const [taskGrid, setTaskGrid] = useState(() => control.parts.find('taskGrid'));

    useEffect(() => {
        if (taskGrid) {
            return;
        }
        let isMounted = true;
        control.parts.whenAvailable('taskGrid', resolved => {
            if (isMounted) {
                setTaskGrid(resolved);
            }
        });
        return () => {
            isMounted = false;
        };
    }, []);

    return taskGrid;
};
