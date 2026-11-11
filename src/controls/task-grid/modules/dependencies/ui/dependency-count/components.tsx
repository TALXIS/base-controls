import { Icon, IIconProps, ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of {@link DependencyCount}. */
export interface IDependenciesUiCountComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    /** Points down for predecessors and up for successors. */
    onRenderArrow: (props: IIconProps) => JSX.Element | null;
    onRenderCount: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link IDependenciesUiCountComponents}. */
export const DependenciesUiCountComponents: IDependenciesUiCountComponents = {
    onRender: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderArrow: props => <Icon {...props} />,
    onRenderCount: props => <Text {...props} />,
};
