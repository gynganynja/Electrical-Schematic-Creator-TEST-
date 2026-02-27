import { Position } from '@xyflow/react';

/**
 * Maps a base handle position (relative to an unrotated component)
 * to its actual position based on the component's rotation.
 * 
 * @param basePos The original position (Left, Right, Top, Bottom)
 * @param rotation Rotation in degrees (0, 90, 180, 270)
 * @returns The physical position to place the handle
 */
export function getRotationPosition(basePos: Position, rotation: number = 0): Position {
    const r = ((rotation % 360) + 360) % 360; // Normalize

    if (r === 0) return basePos;

    if (r === 90) {
        switch (basePos) {
            case Position.Left: return Position.Top;
            case Position.Right: return Position.Bottom;
            case Position.Top: return Position.Right;
            case Position.Bottom: return Position.Left;
        }
    }
    if (r === 180) {
        switch (basePos) {
            case Position.Left: return Position.Right;
            case Position.Right: return Position.Left;
            case Position.Top: return Position.Bottom;
            case Position.Bottom: return Position.Top;
        }
    }
    if (r === 270) {
        switch (basePos) {
            case Position.Left: return Position.Bottom;
            case Position.Right: return Position.Top;
            case Position.Top: return Position.Left;
            case Position.Bottom: return Position.Right;
        }
    }

    return basePos;
}
