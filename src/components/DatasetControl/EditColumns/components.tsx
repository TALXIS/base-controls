import { ICommandBarProps } from "@talxis/react-components";
import { CommandBar } from "./CommandBar/CommandBar";

interface ISuffixProps {
    context: 'scopeSelector' | 'columnSelector';
}

export interface IComponents {
    CommandBar: (props: ICommandBarProps) => React.JSX.Element;
    OptionSuffix?: (props: ISuffixProps) => React.JSX.Element;

}

export const components: IComponents = {
    CommandBar: (props: ICommandBarProps) => <CommandBar {...props} />
}