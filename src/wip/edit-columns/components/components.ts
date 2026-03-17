import { ICommandBarProps } from "@talxis/react-components";
import { CommandBar } from "./CommandBar/CommandBar";
import { IColumn } from "@talxis/client-libraries";
import { GroupBase, OptionProps } from "react-select";
import { OptionText } from "./OptionText/OptionText";
import { SortableItemCommandBar } from "./SortableItemCommandBar/SortableItemCommandBar";
import { OptionCommandBar } from "./OptionCommandBar/OptionCommandBar";
import { IPanelProps, Panel } from "../../panel";

export interface IOptionCommandBarProps extends ICommandBarProps {
    context: 'scopeSelector' | 'columnSelector';
    column: IColumn;
}

export interface ISortableItemCommandBarProps extends ICommandBarProps {
    column: IColumn;
}

export interface IComponents {
    CommandBar: (props: ICommandBarProps) => React.JSX.Element;
    OptionText: (props: React.PropsWithChildren<OptionProps<IColumn, boolean, GroupBase<IColumn>>>) => React.JSX.Element;
    SortableItemCommandBar: (props: ISortableItemCommandBarProps) => React.JSX.Element;
    OptionCommandBar: (props: IOptionCommandBarProps) => React.JSX.Element;
    Panel: (props: IPanelProps) => React.JSX.Element;

}

export const components: IComponents = {
    CommandBar: CommandBar,
    OptionText: OptionText,
    SortableItemCommandBar: SortableItemCommandBar,
    OptionCommandBar: OptionCommandBar,
    Panel: Panel
}