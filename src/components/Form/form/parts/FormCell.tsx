import * as React from "react";
import type { FormXmlCell } from "@talxis/client-metadata";
import { Cell, Control } from "../../components";

export interface IFormCellProps {
    cell: FormXmlCell;
}

export const FormCell = ({ cell }: IFormCellProps) => {
    const control = cell.control;
    const isSpacer = cell.userspacer === true;

    if (!control && !isSpacer) {
        return null;
    }

    return (
        <Cell
            id={cell.id}
            labelId={cell.labelid}
            lockLevel={cell.locklevel}
            visible={cell.visible !== false}
            colspan={cell.colspan}
            rowspan={cell.rowspan}
            userspacer={isSpacer}
            showLabel={cell.showlabel !== false}
            availableForPhone={cell.availableforphone}
            isPreviewCell={cell.ispreviewcell}
            isStreamCell={cell.isstreamcell}
            isChartCell={cell.ischartcell}
            isTileCell={cell.istilecell}
            auto={cell.auto}
            addedBy={cell.addedby}
        >
            {control ? (
                <Control
                    id={control.id}
                    classid={control.classid ?? ""}
                    datafieldname={control.datafieldname}
                    disabled={control.disabled}
                    isrequired={control.isrequired}
                    relationship={control.relationship}
                />
            ) : null}
        </Cell>
    );
};
