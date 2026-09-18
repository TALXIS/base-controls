import { IOnSaveParams } from "@components/Form/strategies";
import { IColumn } from "@talxis/client-libraries";
import { XrmMemoryStrategy } from "./XrmMemoryStrategy";
import type { IXrmFormStrategy } from "../interfaces";

export type ISaveResponse = { success: true } | { success: false, error: string };

export interface IFormConfig {
    formXml?: string;
    entityName?: string;
    entityId?: string;
    formId?: string;
    columns?: IColumn[];
    data?: { [key: string]: any };
    metadata?: {
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    };
    onSave?: (params: IOnSaveParams) => Promise<ISaveResponse>;
}

export class XrmClientApiStrategyFactory {
    public static create(config: IFormConfig): IXrmFormStrategy {
        this.validateConfig(config);

        const strategy = new XrmMemoryStrategy({
            onGetColumns: () => config.columns!,
            onGetData: () => config.data ?? {},
            onGetMetadata: () => config.metadata!,
            onGetFormXml: () => config.formXml!,
        });

        if (config.onSave) {
            strategy.onSave = this.createOnSaveHandler(config.onSave);
        }

        return strategy;
    }

    private static validateConfig(config: IFormConfig): void {
        if (!config.formXml || !config.metadata || !config.columns) {
            throw new Error("Form control requires formXml, metadata and columns to be provided in the config.");
        }
    }

    private static createOnSaveHandler(handler: (params: IOnSaveParams) => Promise<ISaveResponse>) {
        return async (params: IOnSaveParams) => {
            const result = await handler(params);
            const { recordId, updatedData } = params;
            const fields = Object.keys(updatedData ?? {});

            if (result.success) {
                return {
                    recordId,
                    success: true,
                    fields,
                };
            }

            return {
                recordId,
                success: false,
                fields,
                errors: [{
                    message: result.error,
                }],
            };
        };
    }
}
