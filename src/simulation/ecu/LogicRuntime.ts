export type LogicBlockType = 'COMPARE' | 'TIMER' | 'LATCH' | 'MATH' | 'CAN_TX' | 'CAN_RX';

export interface LogicRule {
    id: string;
    type: LogicBlockType;
    config: any;
}

// ---- Helpers ----

/** Resolve a value source: literal number, input pin, or internal variable */
function resolveValue(
    source: string | number | undefined,
    inputs: Record<string, number>,
    vars: Record<string, number>,
    fallback = 0
): number {
    if (source === undefined || source === null || source === '') return fallback;
    if (typeof source === 'number') return source;
    // Named pin or variable
    if (source in inputs) return inputs[source];
    if (source in vars) return vars[source];
    // Try parsing as a literal number string
    const num = parseFloat(source);
    if (!isNaN(num)) return num;
    // Named source not found in inputs/vars — return NaN so comparisons
    // against a missing pin don't falsely trigger (NaN < x is always false)
    return NaN;
}

/** Evaluate a comparison operation */
function evalOp(op: string, left: number, right: number): boolean {
    switch (op) {
        case '>':  return left > right;
        case '<':  return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        case '==': return Math.abs(left - right) < 0.01;
        case '!=': return Math.abs(left - right) >= 0.01;
        default:   return left > right;
    }
}

/** Compute drive voltage from config */
function driveVoltage(config: any, conditionMet: boolean): number {
    if (!conditionMet) return NaN; // High-Z when condition not met
    const driveType = config.driveType ?? 'HIGH_SIDE';
    if (driveType === 'CUSTOM') return config.driveVoltage ?? 12;
    return driveType === 'LOW_SIDE' ? 0 : 12;
}

export class LogicRuntime {
    private timers: Map<string, number> = new Map();
    private latches: Map<string, boolean> = new Map();
    private variables: Map<string, Record<string, number>> = new Map(); // ecuId -> vars
    private rxDataCache: Map<string, number[]> = new Map(); // ruleId -> last received data bytes

    reset() {
        this.timers.clear();
        this.latches.clear();
        this.variables.clear();
        this.rxDataCache.clear();
    }

    /** Get internal variables for an ECU (for UI display / inter-rule chaining) */
    getVariables(ecuId: string): Record<string, number> {
        return this.variables.get(ecuId) || {};
    }

    /**
     * Executes a set of rules for an ECU
     * @param inputs Current input states { pinName: voltage/value }
     * @param rules Array of LogicRule
     * @param timestamp Current simulation time
     * @param canRxFrames Frames received from the CAN bus this tick
     * @param ecuId Unique ECU identifier for variable scoping
     * @returns Output states { pinName: voltage/value } and any enqueued CAN frames
     */
    execute(
        inputs: Record<string, number>,
        rules: any,
        timestamp: number,
        canRxFrames: any[] = [],
        ecuId: string = '__default'
    ) {
        const outputs: Record<string, number> = {};
        const canFrames: any[] = [];

        // Internal variables for this ECU — persisted across ticks, readable by all rules
        if (!this.variables.has(ecuId)) this.variables.set(ecuId, {});
        const vars = this.variables.get(ecuId)!;

        // Safety: ensure rules is an array
        if (!Array.isArray(rules)) return { outputs, canFrames };

        for (const rule of rules) {
            if (!rule || typeof rule !== 'object') continue;

            // Rule Migration / Resilience: If it's an old style rule, adapt it or skip if malformed
            let type = rule.type;
            let config = rule.config;

            if (!type && rule.inputPin) {
                // Migrate "Flat" rule to "COMPARE"
                type = 'COMPARE';
                config = {
                    input: rule.inputPin,
                    op: rule.condition || '>',
                    threshold: rule.threshold ?? 6,
                    output: rule.outputPin || 'out1',
                    driveType: 'HIGH_SIDE'
                };
            }

            if (!type || !config) continue;

            const ruleId = rule.id || `legacy-${JSON.stringify(config)}`;

            switch (type) {
                // ─── COMPARE ────────────────────────────────────────
                // Compare an input/var against a threshold (number, pin, or var)
                // Operators: > < >= <= == !=
                // Can drive an output pin and/or write result to an internal variable
                case 'COMPARE': {
                    const left = resolveValue(config.input, inputs, vars, 0);
                    const right = resolveValue(config.compareSource === 'pin' ? config.comparePin :
                                               config.compareSource === 'var' ? config.compareVar :
                                               config.threshold, inputs, vars, 5);
                    const op = config.op ?? '>';
                    let result = evalOp(op, left, right);

                    // Evaluate optional AND conditions — all must be true
                    if (result && Array.isArray(config.andConditions)) {
                        for (const cond of config.andConditions) {
                            if (!cond || !cond.input) continue;
                            const aLeft = resolveValue(cond.input, inputs, vars, 0);
                            const aRight = resolveValue(cond.compareSource === 'pin' ? cond.comparePin :
                                                        cond.compareSource === 'var' ? cond.compareVar :
                                                        cond.threshold, inputs, vars, 5);
                            if (!evalOp(cond.op ?? '>', aLeft, aRight)) { result = false; break; }
                        }
                    }

                    // Drive output pin
                    const outputPin = config.output;
                    if (outputPin) {
                        outputs[outputPin] = driveVoltage(config, result);
                    }

                    // Optionally write boolean result to internal variable (1.0 or 0.0)
                    if (config.storeVar) {
                        vars[config.storeVar] = result ? 1.0 : 0.0;
                    }
                    break;
                }

                // ─── TIMER ──────────────────────────────────────────
                // Delay-on or delay-off timer
                case 'TIMER': {
                    const trigger = resolveValue(config.input, inputs, vars, 0) > 0.5;
                    const outputPin = config.output;
                    if (!outputPin) break;

                    const mode = config.mode ?? 'delay_on'; // 'delay_on' | 'delay_off'

                    if (mode === 'delay_on') {
                        if (trigger) {
                            if (!this.timers.has(ruleId)) {
                                this.timers.set(ruleId, timestamp);
                            }
                            const elapsed = timestamp - (this.timers.get(ruleId) || 0);
                            if (elapsed >= (config.delayMs || 0)) {
                                outputs[outputPin] = driveVoltage(config, true);
                            } else {
                                outputs[outputPin] = NaN;
                            }
                        } else {
                            this.timers.delete(ruleId);
                            outputs[outputPin] = NaN;
                        }
                    } else {
                        // delay_off: output goes high immediately, stays high for delayMs after trigger drops
                        if (trigger) {
                            this.timers.set(ruleId, timestamp);
                            outputs[outputPin] = driveVoltage(config, true);
                        } else {
                            const lastActive = this.timers.get(ruleId);
                            if (lastActive !== undefined && (timestamp - lastActive) < (config.delayMs || 0)) {
                                outputs[outputPin] = driveVoltage(config, true);
                            } else {
                                outputs[outputPin] = NaN;
                            }
                        }
                    }
                    break;
                }

                // ─── LATCH ──────────────────────────────────────────
                // SET/RESET flip-flop: SET input latches output ON, RESET input turns it OFF
                case 'LATCH': {
                    const setVal = resolveValue(config.setInput, inputs, vars, 0);
                    const resetVal = resolveValue(config.resetInput, inputs, vars, 0);
                    const outputPin = config.output;
                    if (!outputPin) break;

                    const setThreshold = config.setThreshold ?? 0.5;
                    const resetThreshold = config.resetThreshold ?? 0.5;

                    let latched = this.latches.get(ruleId) ?? false;

                    if (resetVal > resetThreshold) {
                        latched = false;
                    }
                    if (setVal > setThreshold) {
                        latched = true;
                    }

                    this.latches.set(ruleId, latched);
                    outputs[outputPin] = driveVoltage(config, latched);

                    if (config.storeVar) {
                        vars[config.storeVar] = latched ? 1.0 : 0.0;
                    }
                    break;
                }

                // ─── MATH ───────────────────────────────────────────
                // Signal conditioning: output = clamp(input * gain + offset, min, max)
                // Re-range mode: gain+offset auto-derived from inMin/inMax/outMin/outMax
                // Can write result to an output pin voltage or an internal variable
                case 'MATH': {
                    const inputVal = resolveValue(config.input, inputs, vars, 0);

                    let gain: number;
                    let offset: number;
                    let min: number;
                    let max: number;

                    if (config.mathMode === 'rerange') {
                        // Re-range: map inMin..inMax → outMin..outMax
                        const inMin  = config.inMin  ?? 0;
                        const inMax  = config.inMax  ?? 12;
                        const outMin = config.outMin ?? 0;
                        const outMax = config.outMax ?? 5;
                        const span = inMax - inMin;
                        gain   = span !== 0 ? (outMax - outMin) / span : 1;
                        offset = outMin - gain * inMin;
                        min    = Math.min(outMin, outMax);
                        max    = Math.max(outMin, outMax);
                    } else {
                        gain   = config.gain   ?? 1.0;
                        offset = config.offset ?? 0.0;
                        min    = config.min ?? -Infinity;
                        max    = config.max ??  Infinity;
                    }

                    const result = Math.max(min, Math.min(max, inputVal * gain + offset));

                    // Write to output pin as a voltage source
                    if (config.output) {
                        outputs[config.output] = result;
                    }

                    // Write to internal variable
                    if (config.storeVar) {
                        vars[config.storeVar] = result;
                    }
                    break;
                }

                // ─── CAN_TX ─────────────────────────────────────────
                // Transmit a J1939 message when condition is met
                // Condition can be: simple input > 0.5, or a full comparison
                // Data bytes can embed live input/var values
                case 'CAN_TX': {
                    // Evaluate trigger condition
                    let shouldTransmit = false;

                    if (config.conditionMode === 'always' || !config.conditionMode) {
                        // Always transmit (periodic passthrough)
                        shouldTransmit = true;
                    } else if (config.conditionMode === 'compare') {
                        // Full comparison mode
                        const left = resolveValue(config.condInput, inputs, vars, 0);
                        const right = resolveValue(
                            config.condCompareSource === 'pin' ? config.condComparePin :
                            config.condCompareSource === 'var' ? config.condCompareVar :
                            config.condThreshold, inputs, vars, 0.5);
                        shouldTransmit = evalOp(config.condOp ?? '>', left, right);
                    } else {
                        // Simple mode: input pin > 0.5V
                        shouldTransmit = (resolveValue(config.input, inputs, vars, 0)) > 0.5;
                    }

                    if (shouldTransmit) {
                        // Build data payload — legacy byte encoding
                        const baseData = config.data || [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
                        const data = [...baseData];
                        if (Array.isArray(config.dataMap)) {
                            for (const mapping of config.dataMap) {
                                const sourceKey = mapping.source === '__var__' ? mapping.varName : mapping.source;
                                const val = resolveValue(sourceKey, inputs, vars, 0);
                                const byteIndex = mapping.byteIndex ?? 0;
                                if (byteIndex >= 0 && byteIndex < 8) {
                                    const scale = mapping.scale ?? (255 / 12);
                                    const offset = mapping.offset ?? 0;
                                    data[byteIndex] = Math.max(0, Math.min(255, Math.round(val * scale + offset)));
                                }
                            }
                        }

                        // floatMap — zero-scaling passthrough: { label, source, varName? }
                        const floatMap: Record<string, number> = {};
                        if (Array.isArray(config.floatMap)) {
                            for (const mapping of config.floatMap) {
                                const sourceKey = mapping.source === '__var__' ? mapping.varName : mapping.source;
                                floatMap[mapping.label] = resolveValue(sourceKey, inputs, vars, 0);
                            }
                        }

                        canFrames.push({
                            type: 'J1939',
                            pgn: config.pgn || 65262,
                            priority: config.priority || 6,
                            data,
                            floatMap,
                            interval: config.interval || 1000
                        });
                    }
                    break;
                }

                // ─── CAN_RX ─────────────────────────────────────────
                // Listen for a J1939 message by PGN (optionally filter by source address)
                // Can drive an output pin and/or extract data bytes into internal variables
                case 'CAN_RX': {
                    const targetPgn = config.pgn;
                    if (!targetPgn) break;

                    // Find matching frame (optionally filter by source address)
                    const matchingFrame = canRxFrames.find(f => {
                        if (f.type !== 'J1939' || f.pgn !== targetPgn) return false;
                        if (config.sourceAddress !== undefined && config.sourceAddress !== null && config.sourceAddress !== '') {
                            return f.sourceAddress === config.sourceAddress;
                        }
                        return true;
                    });

                    if (matchingFrame) {
                        this.timers.set(ruleId, timestamp);
                        if (Array.isArray(matchingFrame.data)) {
                            this.rxDataCache.set(ruleId, [...matchingFrame.data]);
                        }
                        // Cache float map separately
                        if (matchingFrame.floatMap && typeof matchingFrame.floatMap === 'object') {
                            (this.rxDataCache as any).set(ruleId + '_float', { ...matchingFrame.floatMap });
                        }
                    }

                    const lastReceived = this.timers.get(ruleId);
                    const timeout = config.timeoutMs || 2000;
                    const isActive = lastReceived !== undefined && (timestamp - lastReceived) < timeout;

                    // Drive output pin
                    const outputPin = config.output;
                    if (outputPin) {
                        outputs[outputPin] = driveVoltage(config, isActive);
                    }

                    // Extract data bytes into internal variables (legacy byte encoding)
                    if (isActive && Array.isArray(config.extractMap)) {
                        const cachedData = this.rxDataCache.get(ruleId);
                        if (cachedData) {
                            for (const mapping of config.extractMap) {
                                const byteIndex = mapping.byteIndex ?? 0;
                                const varName = mapping.varName;
                                if (!varName || byteIndex < 0 || byteIndex >= cachedData.length) continue;
                                const raw = cachedData[byteIndex] ?? 0;
                                const scale = mapping.scale ?? 1.0;
                                const offset = mapping.offset ?? 0.0;
                                vars[varName] = raw * scale + offset;
                            }
                        }
                    } else if (!isActive && Array.isArray(config.extractMap)) {
                        for (const mapping of config.extractMap) {
                            if (mapping.varName) vars[mapping.varName] = 0;
                        }
                    }

                    // floatMap extraction — zero-scaling passthrough: { label, varName }
                    if (isActive && Array.isArray(config.floatMap)) {
                        const cachedFloat = (this.rxDataCache as any).get(ruleId + '_float') as Record<string, number> | undefined;
                        if (cachedFloat) {
                            for (const mapping of config.floatMap) {
                                if (mapping.varName && mapping.label in cachedFloat) {
                                    vars[mapping.varName] = cachedFloat[mapping.label];
                                }
                            }
                        }
                    } else if (!isActive && Array.isArray(config.floatMap)) {
                        for (const mapping of config.floatMap) {
                            if (mapping.varName) vars[mapping.varName] = 0;
                        }
                    }
                    break;
                }
            }
        }

        return { outputs, canFrames };
    }
}
