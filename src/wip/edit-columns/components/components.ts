import { ICommandBarProps } from "@talxis/react-components";
import { CommandBar } from "./CommandBar/CommandBar";
import { IColumn } from "@talxis/client-libraries";
import { GroupBase, OptionProps } from "react-select";
import { OptionText } from "./OptionText/OptionText";
import { IPanelProps, Panel } from "../../panel";


export interface IEditColumnsComponents {
    CommandBar: (props: ICommandBarProps) => React.JSX.Element;
    OptionText: (props: React.PropsWithChildren<OptionProps<IColumn, boolean, GroupBase<IColumn>>>) => React.JSX.Element;
    SortableItemCommandBar: (props: ICommandBarProps) => React.JSX.Element;
    OptionCommandBar: (props: ICommandBarProps) => React.JSX.Element;
    Panel: (props: IPanelProps) => React.JSX.Element;

}

export const components: IEditColumnsComponents = {
    CommandBar: CommandBar,
    OptionText: OptionText,
    SortableItemCommandBar: CommandBar,
    OptionCommandBar: CommandBar,
    Panel: Panel
}