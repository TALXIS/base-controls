import { Form } from "../../../../components/Form"
import { IFormXmlCell } from "../../internal/FormXmlForm";
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