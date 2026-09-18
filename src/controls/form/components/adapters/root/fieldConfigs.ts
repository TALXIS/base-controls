import React from "react";
import { IForm } from "@components/Form/internal/FormModel";
import { Field, IFieldProps } from "../field";

interface IRegisteredFieldConfig {
    name: string;
    requiredLevel?: IFieldProps["requiredLevel"];
    validation?: IFieldProps["validation"];
}

const collectFieldConfigs = (children: React.ReactNode): IRegisteredFieldConfig[] => {
    const fieldConfigs = new Map<string, IRegisteredFieldConfig>();

    const visitNode = (node: React.ReactNode): void => {
        React.Children.forEach(node, (child) => {
            if (!React.isValidElement(child)) {
                return;
            }

            if (child.type === Field) {
                const { name, requiredLevel, validation } = child.props as IFieldProps;

                if (name) {
                    fieldConfigs.set(name, { name, requiredLevel, validation });
                }
            }

            if ("children" in child.props) {
                visitNode(child.props.children);
            }
        });
    };

    visitNode(children);
    return Array.from(fieldConfigs.values());
};

export const applyFieldConfigs = (form: IForm, children: React.ReactNode): void => {
    collectFieldConfigs(children).forEach(({ name, requiredLevel, validation }) => {
        if (requiredLevel != null) {
            form.setFieldRequiredLevel(name, requiredLevel);
        }

        if (validation != null) {
            form.setFieldValid(name, validation);
        }
    });
};
