import { IDataProvider, IRawRecord, IRecord, IRecordDeleteOperationResult, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { ITaskDataProvider } from "../task-data-provider";


export interface IRecordsDeleteResult {
    success: boolean;
    results: IRecordDeleteOperationResult[]
}


export interface ISourceDataProvider extends IDataProvider {
    onIsTemplateProvider(): boolean;
    onGetCurrentEntityId(): string;
    onIsSelfReferenceParentScope(): boolean;
    onCreateTask(parentTaskId?: string): Promise<IRawRecord | null>;
    onDeleteTasks(taskIds: string[]): Promise<IRecordsDeleteResult>;
    onCreateTemplateFromTask(taskId: string): Promise<IRawRecord>;
    onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[]>;
    onEditTasks(taskIds: string[]): Promise<IRawRecord[]>;
    onMoveTask(movingTaskId: string, movingToTaskId: string, position: 'above' | 'below' | 'child'): Promise<void>;
    onFetchRawRecords(ids: string[]): Promise<IRawRecord[]>;
    onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult>;
}