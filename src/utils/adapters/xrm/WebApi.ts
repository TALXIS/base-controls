import { notImplemented } from "./utils";

export interface IWebApiParams {
}

export class WebApi {
    public createRecord(entityLogicalName: string, record: any): Xrm.Async.PromiseLike<Xrm.CreateResponse> {
        void entityLogicalName;
        void record;
        return notImplemented("WebApi.createRecord");
    }

    public deleteRecord(entityLogicalName: string, id: string): Xrm.Async.PromiseLike<string> {
        void entityLogicalName;
        void id;
        return notImplemented("WebApi.deleteRecord");
    }

    public retrieveMultipleRecords(
        entityLogicalName: string,
        options?: string,
        maxPageSize?: number,
    ): Xrm.Async.PromiseLike<Xrm.RetrieveMultipleResult> {
        void entityLogicalName;
        void options;
        void maxPageSize;
        return notImplemented("WebApi.retrieveMultipleRecords");
    }

    public retrieveRecord(
        entityLogicalName: string,
        id: string,
        options?: string,
    ): Xrm.Async.PromiseLike<any> {
        void entityLogicalName;
        void id;
        void options;
        return notImplemented("WebApi.retrieveRecord");
    }

    public updateRecord(
        entityLogicalName: string,
        id: string,
        record: any,
    ): Xrm.Async.PromiseLike<string> {
        void entityLogicalName;
        void id;
        void record;
        return notImplemented("WebApi.updateRecord");
    }

    public isAvailableOffline(entityLogicalName: string): boolean {
        void entityLogicalName;
        return false;
    }

    public readonly online = {
        createRecord: (entityLogicalName: string, record: any) => this.createRecord(entityLogicalName, record),
        deleteRecord: (entityLogicalName: string, id: string) => this.deleteRecord(entityLogicalName, id),
        retrieveMultipleRecords: (entityLogicalName: string, options?: string, maxPageSize?: number) =>
            this.retrieveMultipleRecords(entityLogicalName, options, maxPageSize),
        retrieveRecord: (entityLogicalName: string, id: string, options?: string) =>
            this.retrieveRecord(entityLogicalName, id, options),
        updateRecord: (entityLogicalName: string, id: string, record: any) =>
            this.updateRecord(entityLogicalName, id, record),
        execute: (request: any) => {
            void request;
            return notImplemented("WebApi.online.execute");
        },
        executeMultiple: (request: any[]) => {
            void request;
            return notImplemented("WebApi.online.executeMultiple");
        },
    };

    public readonly offline = {
        createRecord: (entityLogicalName: string, record: any) => this.createRecord(entityLogicalName, record),
        deleteRecord: (entityLogicalName: string, id: string) => this.deleteRecord(entityLogicalName, id),
        retrieveMultipleRecords: (entityLogicalName: string, options?: string, maxPageSize?: number) =>
            this.retrieveMultipleRecords(entityLogicalName, options, maxPageSize),
        retrieveRecord: (entityLogicalName: string, id: string, options?: string) =>
            this.retrieveRecord(entityLogicalName, id, options),
        updateRecord: (entityLogicalName: string, id: string, record: any) =>
            this.updateRecord(entityLogicalName, id, record),
    };
}
