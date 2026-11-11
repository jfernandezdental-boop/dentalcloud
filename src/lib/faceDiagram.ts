/**
 * Diagrama clínico facial.
 * Preferimos el asset estático en public/aesthetics/face-diagram.jpg
 * (perfil izquierdo · frente · perfil derecho).
 * Si no está, FaceSelector usa silueta SVG de respaldo.
 */
export const FACE_DIAGRAM_SRC = '/aesthetics/face-diagram.jpg';

/** @deprecated usar FACE_DIAGRAM_SRC */
export const FACE_DIAGRAM_DATA_URL = FACE_DIAGRAM_SRC;
