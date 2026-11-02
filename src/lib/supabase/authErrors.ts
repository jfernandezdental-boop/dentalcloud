/**
 * Mensajes para el usuario final. No revelan configuracion interna (Supabase, RLS, funciones);
 * el detalle tecnico va solo a la consola del navegador.
 */
export function friendlyAuthError(message: string): string {
  const raw = message || '';
  const m = raw.toLowerCase();

  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Correo o contrasena incorrectos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Tu correo aun no esta confirmado. Contacta al administrador.';
  }
  if (m.includes('rate limit') || m.includes('too many') || m.includes('429')) {
    return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed')) {
    return 'No se pudo conectar. Revisa tu conexion a internet e intenta de nuevo.';
  }
  if (m.includes('already registered') || m.includes('user already') || m.includes('ya existe una cuenta')) {
    return 'Ya existe una cuenta con ese correo.';
  }
  if (m.includes('email address') && m.includes('invalid')) {
    return 'Correo no valido.';
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'El registro no esta disponible por el momento.';
  }
  if (m.includes('faltan next_public') || m.includes('dummy')) {
    console.error('[config]', raw);
    return 'Servicio no disponible por el momento. Intenta mas tarde.';
  }
  if (m.includes('permission') || m.includes('policy') || m.includes('rls') || m.includes('function')) {
    console.error('[servicio]', raw);
    return 'No se pudo completar la solicitud. Intenta de nuevo en unos minutos.';
  }
  return raw;
}
