import { Form } from "@components/Form/components/Form"
import { IFormXmlCell } from "@components/Form/extensions/form-xrm/internal/FormXmlForm";
import { XrmControl } from "../xrm-control";
import { useCell } from "./useCell";

export const XrmCell = ({ cell }: { cell: IFormXmlCell }) => {
    cell = useCell(cell);

    return <Form.Cell
        colspan={cell.colspan}
        rowspan={cell.rowspan}
        label={cell.getLabel() ?? undefined}>
        {cell.control && <XrmControl control={cell.control} />}
    </Form.Cell>

}