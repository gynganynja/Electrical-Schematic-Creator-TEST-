import type { DTC, FaultState, DiagnosticConfig } from '../can/types';

export class DiagnosticsEngine {
    private dtcs: Map<string, DTC> = new Map();
    private faultStates: Map<string, { state: FaultState, timer: number }> = new Map();
    private config: DiagnosticConfig;

    constructor(config: DiagnosticConfig) {
        this.config = config;
    }

    /**
     * Process a fault condition
     * @param faultId Unique ID for the fault (e.g. "P0123")
     * @param isPresent Current electrical/logic state of the fault
     * @param timestamp Current simulation time
     */
    updateFault(faultId: string, isPresent: boolean, timestamp: number) {
        let current = this.faultStates.get(faultId);
        if (!current) {
            current = { state: 'NONE', timer: 0 };
            this.faultStates.set(faultId, current);
        }

        switch (current.state) {
            case 'NONE':
                if (isPresent) {
                    current.state = 'DEBOUNCING';
                    current.timer = timestamp;
                }
                break;

            case 'DEBOUNCING':
                if (isPresent) {
                    if (timestamp - current.timer >= this.config.faultThreshold) {
                        current.state = 'ACTIVE';
                        this.logDTC(faultId, timestamp);
                    }
                } else {
                    current.state = 'NONE';
                }
                break;

            case 'ACTIVE':
                if (!isPresent) {
                    current.state = 'DEBOUNCING'; // Debounce clearing too
                    current.timer = timestamp;
                }
                break;

            case 'LATCHED':
                // Only cleared via UDS service
                break;
        }
    }

    private logDTC(code: string, timestamp: number) {
        const existing = this.dtcs.get(code);
        if (existing) {
            existing.count++;
            existing.timestamp = timestamp;
            existing.status |= 1; // Bit 0: Active
        } else {
            this.dtcs.set(code, {
                code,
                status: 1,
                timestamp,
                count: 1
            });
        }
    }

    getDTCs(): DTC[] {
        return Array.from(this.dtcs.values());
    }

    clearDTCs() {
        this.dtcs.clear();
        this.faultStates.forEach(v => {
            if (v.state === 'LATCHED' || v.state === 'ACTIVE') {
                // Reset to none if logic allows, or keep ACTIVE if still present
                // For now, full reset.
                v.state = 'NONE';
            }
        });
    }
}
