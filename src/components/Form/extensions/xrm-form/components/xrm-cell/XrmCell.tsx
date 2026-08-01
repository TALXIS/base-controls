import { Form } from "@components/Form/components/Form"
import { IFormXmlCell } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
import { XrmControl } from "../xrm-control";
import { useCell } from "./useCell";

export const XrmCell = ({ cell }: { cell: IFormXmlCell }) => {
    cell = useCell(cell);

    return <Form.Cell
        id={cell.id ?? cell.control?.datafieldname ?? undefined}
        colspan={cell.colspan}
        rowspan={cell.rowspan}
        label={cell.getLabel() ?? undefined}>
        {cell.control && <XrmControl control={cell.control} />}
    </Form.Cell>

}