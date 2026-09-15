import { IBaseParameters } from "@interfaces/parameters";

export interface IControlSizing {
    height?: number | string;
    width?: number;
    /** Whether the height is the container's rather than a number, which is what the fill styles key on. */
    fillsAvailableSpace: boolean;
}

/**
 * How big the control is to be drawn.
 *
 * The host allocates a height, and a host that sizes the box itself asks for it to be filled instead - at
 * which point the number is not the answer, the container is.
 */
export const useControlSizing = (mode: ComponentFramework.Mode, parameters?: IBaseParameters): IControlSizing => {
    const getAllocationSize = (allocationSize?: number) => {
        if(!allocationSize || allocationSize === -1) {
            return undefined;
        }
        return allocationSize;
    }
    const fillsAvailableSpace = parameters?.FillAvailableSpace?.raw === true;
    return {
        height: fillsAvailableSpace ? '100%' : getAllocationSize(mode.allocatedHeight),
        width: getAllocationSize(mode.allocatedWidth),
        fillsAvailableSpace: fillsAvailableSpace
    }
}
