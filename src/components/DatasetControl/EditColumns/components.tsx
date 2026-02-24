import { ICommandBarProps } from "@talxis/react-components";
import { CommandBar } from "./CommandBar/CommandBar";
import { IColumn } from "@talxis/client-libraries";

interface ISuffixProps {
    context: 'scopeSelector' | 'columnSelector';
    column: IColumn;
}

export interface IComponents {
    CommandBar: (props: ICommandBarProps) => React.JSX.Element;
    OptionSuffix?: (props: ISuffixProps) => React.JSX.Element;

}

export const components: IComponents = {
    CommandBar: (props: ICommandBarProps) => <CommandBar {...props} />
}