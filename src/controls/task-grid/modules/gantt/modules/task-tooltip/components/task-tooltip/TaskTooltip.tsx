import { DirectionalHint, ICalloutProps, Icon, useTheme } from '@fluentui/react';
import { useMemo } from 'react';
import { getTaskTooltipStyles } from './styles';

export interface ITaskTooltipProps {
    taskName?: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    statusColor?: string;
}

export const TaskTooltip = (props: ITaskTooltipProps) => {
    const { taskName, startDate, endDate, duration, statusColor } = props;
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipStyles(theme, statusColor), [theme, statusColor]);

    return (
        <div className={styles.root}>
            {taskName && (
                <div className={styles.header}>
                    {statusColor && <div className={styles.statusDot} />}
                    <span className={styles.title}>{taskName}</span>
                </div>
            )}
            <div className={styles.rows}>
                {startDate && (
                    <div className={styles.row}>
                        <Icon iconName="Calendar" className={styles.icon} />
                        <span className={styles.label}>{endDate ? 'Start' : 'Date'}</span>
                        <span className={styles.value}>{startDate}</span>
                    </div>
                )}
                {endDate && (
                    <div className={styles.row}>
                        <Icon iconName="CalendarReply" className={styles.icon} />
                        <span className={styles.label}>End</span>
                        <span className={styles.value}>{endDate}</span>
                    </div>
                )}
                {duration && (
                    <div className={styles.row}>
                        <Icon iconName="Clock" className={styles.icon} />
                        <span className={styles.label}>Duration</span>
                        <span className={styles.durationBadge}>
                            {duration}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
