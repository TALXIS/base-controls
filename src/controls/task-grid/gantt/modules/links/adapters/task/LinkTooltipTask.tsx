import { useLabels } from "@labels";
import { LINKS_LABELS } from "../../labels";
import { IFieldValueComponents, Field } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipTaskProps {
    end: 'predecessor' | 'successor';
    iconName: string;
    components?: Partial<IFieldValueComponents>;
}

/** The name of the task at one end of the dependency. */
export const LinkTooltipTask = (props: ILinkTooltipTaskProps) => {
    const { gantt, dependency } = useLinkTooltip();
    const labels = useLabels(LINKS_LABELS);
    const chart = gantt.services.get('chart');
    const taskId = props.end === 'predecessor' ? dependency.predecessorTaskId : dependency.successorTaskId;
    return <Field.Value label={labels.get(`links.${props.end}`)} iconName={props.iconName} components={props.components}>
        {chart.isTaskExists(taskId) ? chart.getTask(taskId).text : ''}
    </Field.Value>;
};
