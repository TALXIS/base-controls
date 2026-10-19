import { ReactNode, useEffect, useMemo } from "react";
import { useContextWithNullCheck } from "@utils";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import { TaskDatasetControlRuntime } from "../runtime/TaskDatasetControlRuntime";
import { TaskDatasetControlContext, TaskDatasetControlPropsContext } from "./context";
import { useTaskDatasetControlEventHandlers } from "./useTaskDatasetControlEventHandlers";

/** One mount's task runtime: there before the mount loads, gone with it. */
export const TaskDatasetControlScope = (props: { children: ReactNode }) => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const { labels, pcfContext, propsRef } = useContextWithNullCheck(TaskDatasetControlPropsContext);
    const runtime = useMemo(() => {
        const created = new TaskDatasetControlRuntime({ datasetControl, labels, pcfContext, onGetProps: () => propsRef.current });
        datasetControl.services.register('taskDatasetControl', () => created);
        return created;
    }, []);

    //there once the load finished, which renders the scope again
    useTaskDatasetControlEventHandlers(runtime.services.find('provider'), propsRef);

    useEffect(() => () => runtime.destroy(), []);

    return <TaskDatasetControlContext.Provider value={runtime}>{props.children}</TaskDatasetControlContext.Provider>;
};
