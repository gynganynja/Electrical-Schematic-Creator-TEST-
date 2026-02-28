import type { CANFrame, DTC } from './types';

export interface CANBusState {
    id: string;
    bitrate: number;
    frames: CANFrame[];
    lastArbitratedId: number | null;
    busLoad: number; // 0-100
    isActive: boolean;
}

export class CANScheduler {
    private txQueue: Record<string, CANFrame[]> = {}; // busId -> frames
    private periodicMessages: Record<string, { frame: CANFrame, intervalMs: number, lastSentTick: number }[]> = {}; // busId -> messages

    constructor() { }

    /**
     * Submit a frame for transmission
     */
    enqueueFrame(_nodeId: string, busId: string, frame: CANFrame) {
        if (!this.txQueue[busId]) this.txQueue[busId] = [];
        this.txQueue[busId].push({ ...frame, timestamp: Date.now() });
    }

    /**
     * Register a message to be sent periodically
     */
    registerPeriodicMessage(busId: string, frame: CANFrame, intervalMs: number) {
        if (!this.periodicMessages[busId]) this.periodicMessages[busId] = [];
        const existing = this.periodicMessages[busId].find(p => p.frame.id === frame.id);
        if (existing) {
            existing.intervalMs = intervalMs;
            existing.frame = frame;
        } else {
            this.periodicMessages[busId].push({ frame, intervalMs, lastSentTick: 0 });
        }
    }

    /**
     * Unregister a periodic message by frame ID
     */
    unregisterPeriodicMessage(busId: string, frameId: number) {
        if (!this.periodicMessages[busId]) return;
        this.periodicMessages[busId] = this.periodicMessages[busId].filter(p => p.frame.id !== frameId);
    }

    /**
     * Step the simulation for CAN
     * @returns frames delivered in this tick
     */
    step(busId: string, canCommunicate: boolean, currentTick: number): CANFrame[] {
        if (!canCommunicate) {
            return [];
        }

        // 1. Check for due periodic messages
        const periodics = this.periodicMessages[busId] || [];
        for (const p of periodics) {
            if (currentTick - p.lastSentTick >= p.intervalMs) {
                this.enqueueFrame('system', busId, { ...p.frame, timestamp: currentTick });
                p.lastSentTick = currentTick;
            }
        }

        const queue = this.txQueue[busId] || [];
        if (queue.length === 0) return [];

        // 1. Filter frames ready for current time
        const readyFrames = queue.filter(f => f.timestamp <= currentTick);
        if (readyFrames.length === 0) return [];

        // 2. Arbitration
        // Standard CAN: lowest ID wins
        // J1939: Lowest ID wins (Priority is bits 28-26 of the 29-bit ID)
        readyFrames.sort((a, b) => {
            // Priority is high-order bits 28-26
            const pA = a.ide ? (a.id >> 26) & 0x7 : 99;
            const pB = b.ide ? (b.id >> 26) & 0x7 : 99;

            if (pA !== pB) return pA - pB;
            return a.id - b.id;
        });

        const winner = readyFrames[0];

        // Remove winner from the main queue
        const winnerIndex = queue.indexOf(winner);
        queue.splice(winnerIndex, 1);

        this.txQueue[busId] = queue;

        return [{ ...winner, timestamp: currentTick }];
    }

    /**
     * Handle UDS Diagnostic Services
     */
    handleUDSRequest(_busId: string, request: CANFrame, dtcs: DTC[]): CANFrame | null {
        // Simple UDS: Request ID usually 0x7E0, Response 0x7E8 (Standard OBD)
        // Request: [Len][Service][Sub][...]
        // 0x19: ReadDTCInformation
        if (request.data[1] === 0x19) {
            // Positive response: [Len][Service+0x40][Sub][numDTCs][DTC1_H][DTC1_L][...]
            const responseData = [0x00, 0x59, request.data[2], dtcs.length];
            dtcs.forEach(_dtc => {
                // Simplified DTC encoding (mocked)
                responseData.push(0x01, 0x23, 0x01); // P0123
            });
            return {
                id: request.id + 8,
                ide: request.ide,
                dlc: 8,
                data: responseData.slice(0, 8),
                timestamp: Date.now()
            };
        }

        // 0x14: ClearDiagnosticInformation
        if (request.data[1] === 0x14) {
            return {
                id: request.id + 8,
                ide: request.ide,
                dlc: 8,
                data: [0x01, 0x54, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
                timestamp: Date.now()
            };
        }

        return null;
    }

    reset() {
        this.txQueue = {};
        this.periodicMessages = {};
    }

    /**
     * Static helper to build J1939 29-bit ID
     */
    static buildJ1939Id(priority: number, pgn: number, sourceAddress: number): number {
        // ID = [Priority (3 bits)] | [Res (1 bit)] | [Data Page (1 bit)] | [PGN (16 bits)] | [Source Address (8 bits)]
        // Simplified PGN encoding for J1939 on 29-bit CAN
        return ((priority & 0x7) << 26) | ((pgn & 0x3FFFF) << 8) | (sourceAddress & 0xFF);
    }
}

// Global instance for the simulation
export const globalCANScheduler = new CANScheduler();
