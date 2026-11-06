export interface IModeParameters {
    allocatedHeight?: number;
    allocatedWidth?: number;
    isControlDisabled?: boolean;
    isVisible?: boolean;
    label?: string;
}

export class Mode implements ComponentFramework.Mode {
    public allocatedHeight: number;
    public allocatedWidth: number;
    public isControlDisabled: boolean;
    public isVisible: boolean;
    public label: string;

    private _controlState: ComponentFramework.Dictionary = {};
    private _isFullScreen: boolean = false;
    private _trackContainerResize: boolean = false;

    constructor(parameters: IModeParameters = {}) {
        this.allocatedHeight = parameters.allocatedHeight ?? -1;
        this.allocatedWidth = parameters.allocatedWidth ?? -1;
        this.isControlDisabled = parameters.isControlDisabled ?? false;
        this.isVisible = parameters.isVisible ?? true;
        this.label = parameters.label ?? "";
    }

    public setControlState(state: ComponentFramework.Dictionary): boolean {
        this._controlState = state;
        return true;
    }

    public setFullScreen(value: boolean): void {
        this._isFullScreen = value;
    }

    public trackContainerResize(value: boolean): void {
        this._trackContainerResize = value;
    }
}
