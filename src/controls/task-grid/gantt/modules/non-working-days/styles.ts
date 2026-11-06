import type { IStyle, ITheme } from "@fluentui/react";
import { GANTT_SCALE_CELL_CLASS, GANTT_TASK_CELL_CLASS } from "../../chart";
import { NON_WORKING_DAY_CLASS } from "./classNames";

export const getNonWorkingDaysStyles = (theme: ITheme): IStyle => {
    const tint = `color-mix(in srgb, ${theme.palette.neutralQuaternaryAlt} 30%, transparent)`;
    const hatch = `color-mix(in srgb, ${theme.palette.neutralTertiaryAlt} 35%, transparent)`;
    return {
        //translucent so the row stripes and selection show through
        [`.${GANTT_TASK_CELL_CLASS}.${NON_WORKING_DAY_CLASS}`]: {
            backgroundColor: tint,
            backgroundImage: `repeating-linear-gradient(135deg, ${hatch} 0 1px, transparent 1px 7px)`,
        },
        [`.${GANTT_SCALE_CELL_CLASS}.${NON_WORKING_DAY_CLASS}`]: {
            backgroundColor: tint,
            color: theme.palette.neutralTertiary,
        },
    };
};
