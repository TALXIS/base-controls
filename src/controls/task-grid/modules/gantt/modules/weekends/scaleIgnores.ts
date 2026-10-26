import type { GanttStatic } from "dhtmlx-gantt";

interface IScaleConfig {
    count: number;
    trace_x: Date[];
    ignore_x: Record<number, boolean>;
    display_count: number;
}

//the timeline calls processIgnores on every scale rebuild and gives the columns in ignore_x no width
interface IGanttScaleInternals {
    $ui?: {
        getView(id: string): { $scaleHelper: { processIgnores(scale: IScaleConfig): void } } | undefined;
    };
}

export const setScaleIgnores = (chart: GanttStatic, isIgnored: (date: Date) => boolean): void => {
    const scaleHelper = (chart as GanttStatic & IGanttScaleInternals).$ui?.getView('timeline')?.$scaleHelper;
    if (!scaleHelper) {
        throw new Error('The Gantt timeline has no scale helper to hide columns with.');
    }
    scaleHelper.processIgnores = scale => {
        const ignored = scale.trace_x.filter(isIgnored);
        //a scale of only ignored columns would have no width to lay out
        const isAllIgnored = ignored.length >= scale.count;
        scale.ignore_x = {};
        if (!isAllIgnored) {
            ignored.forEach(date => scale.ignore_x[date.valueOf()] = true);
        }
        scale.display_count = scale.count - Object.keys(scale.ignore_x).length;
    };
};
