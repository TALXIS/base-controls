import React from "react";
import { IForm } from "../../runtime/FormRuntime";
import { Field, IFieldProps } from "../field";

interface ICollectedField {
    name: string;
    requiredLevel?: IFieldProps["requiredLevel"];
    validation?: IFieldProps["validation"];
}

const collectFields = (children: React.ReactNode): ICollectedField[] => {
    const fieldConfigs = new Map<string, ICollectedField>();

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
    collectFields(children).forEach(({ name, requiredLevel, validation }) => {
        if (requiredLevel !== undefined) {
            form.setFieldRequiredLevel(name, requiredLevel);
        }

        if (validation !== undefined) {
            form.setFieldValid(name, validation);
        }
    });
};
