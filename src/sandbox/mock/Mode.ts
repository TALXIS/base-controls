export class Mode implements ComponentFramework.Mode {
    allocatedHeight: number;
    allocatedWidth: number;
    isControlDisabled: boolean;
    isVisible: boolean;
    label: string;

    constructor() {
        this.allocatedHeight = 0
        this.allocatedWidth = 260;
        this.isControlDisabled = false;
        this.isVisible = true;
        this.label = 'Label'
    }
    setControlState(state: ComponentFramework.Dictionary): boolean {
        throw new Error("Method not implemented.");
    }
    setFullScreen(value: boolean): void {
        throw new Error("Method not implemented.");
    }
    trackContainerResize(value: boolean): void {
        throw new Error("Method not implemented.");
    }
    
}