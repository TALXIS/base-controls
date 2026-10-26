import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_TASK_CELL_CLASS } from "../../chart/classNames";
import { GANTT_WEEKEND_CLASS } from "./classNames";

export const getGanttWeekendsStyles = (theme: ITheme): IStyle => {
    const tint = `color-mix(in srgb, ${theme.palette.neutralQuaternaryAlt} 30%, transparent)`;
    const hatch = `color-mix(in srgb, ${theme.palette.neutralTertiaryAlt} 35%, transparent)`;
    return {
        //translucent so the row stripes and selection show through
        [`.${GANTT_TASK_CELL_CLASS}.${GANTT_WEEKEND_CLASS}`]: {
            backgroundColor: tint,
            backgroundImage: `repeating-linear-gradient(135deg, ${hatch} 0 1px, transparent 1px 7px)`,
        },
        [`.gantt_scale_cell.${GANTT_WEEKEND_CLASS}`]: {
            backgroundColor: tint,
            color: theme.palette.neutralTertiary,
        },
    };
};
