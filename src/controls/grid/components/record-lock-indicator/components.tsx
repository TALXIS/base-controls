import { ICellRendererComponents } from "../cells/cell-renderer/components";
import { LockIcon } from "./lock-icon";

/** The defaults the lock cell draws with, merged under what the caller passes. */
export const RecordLockIndicatorCellComponents: ICellRendererComponents = {
    control: {
        onRenderControl: () => <LockIcon />,
    },
};
