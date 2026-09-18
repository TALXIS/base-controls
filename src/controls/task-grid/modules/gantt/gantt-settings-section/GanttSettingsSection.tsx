import { useGanttServices } from "../context";

/**
 * The Gantt's section of the grid's settings callout: what its modules put there.
 *
 * Empty when none of them do, which the callout draws as nothing at all.
 */
export const GanttSettingsSection = () => {
    const services = useGanttServices();

    return <>{services.find('weekendsModule')?.components.onRenderToggle()}</>;
};
