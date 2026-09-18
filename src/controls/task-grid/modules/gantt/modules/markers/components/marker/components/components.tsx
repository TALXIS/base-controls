import { ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

export interface IMarkerComponents {
    onRenderTooltipHost: (props: ITooltipHostProps) => JSX.Element;
    onRenderContent: (props: React.HtmlHTMLAttributes<HTMLDivElement>) => JSX.Element;
    onRenderContainer: (props: React.HtmlHTMLAttributes<HTMLDivElement>) => JSX.Element;
}

export const MarkerComponents: IMarkerComponents = {
    onRenderContainer: (props: React.HtmlHTMLAttributes<HTMLDivElement>) => <div {...props} />,
    onRenderTooltipHost: (props: ITooltipHostProps) => <TooltipHost {...props} />,
    onRenderContent: (props: React.HtmlHTMLAttributes<HTMLDivElement>) => <div {...props} />
};