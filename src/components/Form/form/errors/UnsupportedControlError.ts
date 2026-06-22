/**
 * Thrown when a form cell references a control that the MVP Form component does not
 * know how to render (custom controls beyond the well-known standard classids).
 */
export class UnsupportedControlError extends Error {
    public readonly cellId: string | undefined;
    public readonly classId: string | undefined;
    public readonly controlName: string | undefined;

    constructor(args: { cellId?: string; classId?: string; controlName?: string }) {
        super(
            `[Form] Unsupported control in cell "${args.cellId ?? "<no-id>"}"` +
            (args.classId ? ` (classid=${args.classId})` : "") +
            (args.controlName ? ` (control=${args.controlName})` : "") +
            ". Custom controls are not rendered in MVP."
        );
        this.name = "UnsupportedControlError";
        this.cellId = args.cellId;
        this.classId = args.classId;
        this.controlName = args.controlName;
    }
}
