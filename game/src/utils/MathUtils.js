export class MathUtils {
    static normalizeZ(z, loopDistance = 350) {
        return ((z % loopDistance) + loopDistance) % loopDistance;
    }
    
    static distance2D(x1, z1, x2, z2) {
        const dx = x1 - x2;
        const dz = z1 - z2;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
    
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
}
