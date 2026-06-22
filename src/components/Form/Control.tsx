import * as React from "react";
import { UnsupportedControlError } from "./form/errors/UnsupportedControlError";
import { FieldInput } from "./form/parts/FieldInput";
import { isStandardControlClassId } from "./form/parts/standardControlClassIds";
import { FormCellContext } from "./FormCellContext";

export interface IFormControlProps {
    classid: string;
    datafieldname?: string;
    controlId?: string;
    disabled?: boolean;
    cellId?: string;
}

export const Control: React.FC<IFormControlProps> = ({
    classid,
    datafieldname,
    controlId,
    disabled,
    cellId,
}) => {
    const cell = React.useContext(FormCellContext);
    const resolvedDatafieldname = datafieldname ?? cell.datafieldname ?? "";
    const resolvedControlId = controlId ?? cell.controlId;
    const resolvedDisabled = disabled ?? cell.disabled;

    if (!isStandardControlClassId(classid)) {
        throw new UnsupportedControlError({
            cellId,
            classId: classid,
            controlName: resolvedControlId,
        });
    }

    if (!resolvedDatafieldname) {
        throw new UnsupportedControlError({
            cellId,
            classId: classid,
            controlName: resolvedControlId,
        });
    }

    return (
        <FieldInput
            classid={classid}
            datafieldname={resolvedDatafieldname}
            controlId={resolvedControlId}
            disabled={resolvedDisabled}
        />
    );
};
