// ============================================================
// Decodificador JWT puro (sin librerías externas)
// Decodifica el payload (segmento central) del token JWT
// ============================================================
import type { JwtPayload } from '../types';

export function decodeJwt(token: string): JwtPayload {
  try {
    const base64Url = token.split('.')[1];
    // Convierte base64url → base64 estándar
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    throw new Error('Token JWT inválido');
  }
}
