import { ErrorHelper } from "../ErrorHelper";

interface IErrorFields {
    message?: unknown;
    stack?: unknown;
    cause?: unknown;
}

/** The title from a thrown value's `message`, and the details from its `cause` or stack. */
export const readError = (exception: unknown): { title: string; details?: string } => ({
    title: ErrorHelper.getMessageFromError(exception),
    details: getDetails(exception),
});

//read off the fields, so an error made in another window counts too
const getDetails = (exception: unknown): string | undefined => {
    if (!isObject(exception)) {
        return undefined;
    }
    const { stack, cause } = exception as IErrorFields;
    if (cause === undefined) {
        return asString(stack);
    }
    if (isObject(cause)) {
        const fields = cause as IErrorFields;
        return asString(fields.stack) ?? asString(fields.message) ?? String(cause);
    }
    return String(cause);
};

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null;

const asString = (value: unknown): string | undefined => typeof value === 'string' ? value : undefined;
