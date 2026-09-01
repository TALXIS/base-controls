import { useMemo } from 'react';
import { DirectionalHint, useTheme } from '@fluentui/react';
import { getTimelineTaskCreateLineStyles } from './styles';
import { TaskTooltip } from '../task-tooltip';
import { TaskTooltipCallout } from '../task-tooltip-callout';

export interface ITimelineTaskCreateLineProps {
    left: number;
    top: number;
    width: number;
    startDate: string;
    endDate: string;
}

export const TimelineTaskCreateLine = (props: ITimelineTaskCreateLineProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getTimelineTaskCreateLineStyles(theme), [theme]);
    const id = useMemo(() => `timeline-task-create-line-${crypto.randomUUID()}`, []);

    return (
        <>
            <div
                id={id}
                className={styles.root}
                style={{ left: props.left, top: props.top, width: props.width }}
            />
            <TaskTooltipCallout target={`#${id}`} directionalHint={DirectionalHint.bottomRightEdge} >
                <TaskTooltip startDate={props.startDate} endDate={props.endDate} />
            </TaskTooltipCallout>
        </>
    );
};
