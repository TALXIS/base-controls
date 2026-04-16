
export class ErrorHelper {
    public static async executeWithErrorHandling<T>(options: { operation: () => Promise<T>; onError?: (error: any, message: string) => void }): Promise<T> {
        const { operation, onError } = options;
        try {
            return await operation();
        }
        catch (error) {
            try {
                onError?.(error, ErrorHelper.getMessageFromError(error));
            } catch { }
            throw error;
        }
    }
    

    public static getMessageFromError(error: any): string {
        if (error instanceof Error && error.message) {
            return error.message;
        }
        else if (typeof error === 'string') {
            return error;
        }
        else if (typeof error === 'object' && error !== null) {
            if ('message' in error && typeof error.message === 'string') {
                return error.message;
            }
            else if ('toString' in error && typeof error.toString === 'function') {
                return error.toString();
            }
            else {
                return JSON.stringify(error);
            }
        }
        else {
            return String(error);
        }
    }
}