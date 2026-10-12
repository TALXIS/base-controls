export interface INotificationsLabels {
    /** `count` is how many notifications there are. */
    groupedNotificationsSummary: string;
}

/** The English defaults for {@link INotificationsLabels}. */
export const NOTIFICATIONS_LABELS: INotificationsLabels = {
    groupedNotificationsSummary: 'You have {{ count }} notifications. Select to view them.',
};
