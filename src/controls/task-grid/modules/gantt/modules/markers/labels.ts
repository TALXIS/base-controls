export interface IGanttMarkersLabels {
    today: string;
    projectStart: string;
    projectEnd: string;
    loadMarkersFailed: string;
}

export const GANTT_MARKERS_LABELS: IGanttMarkersLabels = {
    today: 'Today',
    projectStart: 'Project start',
    projectEnd: 'Project end',
    loadMarkersFailed: 'The markers could not be loaded.',
};
