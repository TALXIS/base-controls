import { Cell, ICellProps } from "./Cell"

export const getEditableCell = () => {
    return (props: ICellProps) => <Cell {...props} editing={true} />
}