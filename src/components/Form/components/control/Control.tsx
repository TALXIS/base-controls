import * as React from "react";
import { useFormCellContext } from "../cell";
import { UnsupportedControlError } from "../../form/errors/UnsupportedControlError";
import { FieldInput } from "../../form/parts/FieldInput";
import { isStandardControlClassId } from "../../form/parts/standardControlClassIds";

export interface IFormControlProps {
    id?: string;
    classid: string;
    datafieldname?: string;
    disabled?: boolean;
    isrequired?: boolean;
    relationship?: string;
}

export const Control = ({
    id,
    classid,
    datafieldname,
    disabled,
}: IFormControlProps) => {
    const cell = useFormCellContext();
    const resolvedDatafieldname = datafieldname ?? "";
    const resolvedControlId = id;

    if (!isStandardControlClassId(classid)) {
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: classid,
            controlName: resolvedControlId,
        });
    }

    if (!resolvedDatafieldname) {
        throw new UnsupportedControlError({
            cellId: cell.id,
            classId: classid,
            controlName: resolvedControlId,
        });
    }

    return (
        <FieldInput
            classid={classid}
            datafieldname={resolvedDatafieldname}
            controlId={resolvedControlId}
            disabled={disabled}
        />
    );
};
