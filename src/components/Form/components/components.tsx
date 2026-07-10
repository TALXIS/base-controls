import { IFormSectionProps, Section } from "./section";

export interface IFormComponents {
    onRenderSection: (props: IFormSectionProps) => React.ReactNode;
}

export const FormComponents: IFormComponents = {
    onRenderSection: (props: IFormSectionProps) => <Section {...props} />
}