
export const useComponentSizing = (mode: ComponentFramework.Mode): {
    height?: number,
    width?: number
} => {
    const getAllocationSize = (allocationSize?: number) => {
        if(!allocationSize || allocationSize === -1) {
            return undefined;
        }
        return allocationSize;
    }
    return {
        height: getAllocationSize(mode.allocatedHeight),
        width: getAllocationSize(mode.allocatedWidth)
    }
}