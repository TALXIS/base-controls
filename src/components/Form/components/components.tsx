import { ISectionProps, Section } from "./section";

export interface IFormComponents {
    onRenderSection: (props: ISectionProps) => React.ReactNode;
}

export const FormComponents: IFormComponents = {
    onRenderSection: (props: ISectionProps) => <Section {...props} />
}