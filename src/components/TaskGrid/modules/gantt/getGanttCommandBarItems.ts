import { ICommandBarItemProps } from "@legacy";
import { IGanttServiceLocator } from "./services";

/** What {@link getGanttCommandBarItems} needs. */
export interface IGanttCommandBarItemsParameters {
    /** The module's locator: the labels, the parts the commands act on, and the loading state. */
    services: IGanttServiceLocator;
}

/**
 * The timeline's own ribbon commands. The header appends them to the grid's.
 *
 * A plain function rather than a component: the header asks for them while it renders its own, and
 * everything they need is on the locator. `find`, not `get`: before there is a chart there is nothing to
 * zoom or scroll, and the commands should do nothing rather than throw.
 */
export const getGanttCommandBarItems = (parameters: IGanttCommandBarItemsParameters): ICommandBarItemProps[] => {
    const { services } = parameters;
    const labels = services.get('labels');
    const isLoading = services.get('taskGridServices').get('taskDataProvider').isLoading();

    return [
        {
            key: 'zoomToFit',
            disabled: isLoading,
            text: labels.getLocalizedString('zoomToFit'),
            iconProps: { iconName: 'ZoomToFit' },
            onClick: () => services.find('ganttZooming')?.zoomToFit(),
        },
        {
            key: 'goToToday',
            disabled: isLoading,
            text: labels.getLocalizedString('goToToday'),
            iconProps: { iconName: 'CalendarDay' },
            onClick: () => services.find('ganttInfiniteTimeline')?.jumpToToday(),
        },
    ];
};
