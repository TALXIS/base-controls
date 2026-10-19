import { useMemo } from "react";
import { PanelType } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { Panel } from "@ui/surfaces/panel/Panel";
import { Form } from "@controls/form/components/Form";
import { MemoryStrategy } from "@controls/form/strategies/MemoryStrategy";
import { useTaskDatasetControl } from "../../../dataset-control/context";
import type { IMemoryTaskFormEvents } from "../MemoryTaskForm";

/** The task opened in the memory data source, saved when its form saves. */
export const MemoryTaskFormDialog = () => {
    const taskDatasetControl = useTaskDatasetControl();
    const form = taskDatasetControl.services.get('memoryTaskForm');
    const provider = taskDatasetControl.getProvider();
    const { rerender } = useRerender();
    useEventEmitter<IMemoryTaskFormEvents>(form.events, 'onChanged', rerender);

    const task = form.getTask();
    const subject = provider.getFieldMapping().subject;
    //the in-memory form has no records to look up from
    const columns = provider.getColumns().filter(column => !column.isHidden && !column.dataType.startsWith('Lookup'));
    const strategy = useMemo(() => task && new MemoryStrategy({
        onGetData: () => task,
        onGetColumns: () => columns,
        onGetMetadata: () => ({ PrimaryIdAttribute: provider.getMetadata().PrimaryIdAttribute!, PrimaryNameAttribute: subject }),
    }), [task]);

    if (!task || !strategy) {
        return null;
    }
    return <Panel isOpen type={PanelType.medium} headerText={task[subject]} onDismiss={() => form.dismiss()}>
        <Form.Root strategy={strategy} onAfterSave={({ success }) => success && form.save()}>
            <Form.Ribbon />
            <Form.Notifications />
            <Form.Section>
                {columns.map(column =>
                    <Form.Field key={column.name} name={column.name}>
                        <Form.Cell><Form.Control /></Form.Cell>
                    </Form.Field>)}
            </Form.Section>
        </Form.Root>
    </Panel>;
};
