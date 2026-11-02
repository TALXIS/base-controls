//a slow backend, to try the loading states
const SIMULATED_DELAY_MS = 1000;

export const SIMULATED_LOAD_DELAY_MS = 3000;

export const simulateBackend = async (delayMs = SIMULATED_DELAY_MS): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
};
