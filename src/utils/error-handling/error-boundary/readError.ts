import { ErrorHelper } from "../ErrorHelper";

/** The title from a thrown value's `message`, and the details from its `cause` or stack. */
export const readError = (exception: unknown): { title: string; details?: string } => ({
    title: ErrorHelper.getMessageFromError(exception),
    details: exception instanceof Error ? getDetails(exception) : undefined,
});

//typed here, since a consumer's `lib` may predate ES2022's `Error.cause`
const getDetails = (error: Error & { cause?: unknown }): string | undefined => {
    const { cause } = error;
    if (cause === undefined) {
        return error.stack;
    }
    return cause instanceof Error ? cause.stack ?? cause.message : String(cause);
};
