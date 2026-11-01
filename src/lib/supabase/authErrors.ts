export function friendlyAuthError(message: string): string {
  const m = (message || '').toLowerCase();

  if (m.includes('rate limit') || m.includes('email rate limit')) {
    return (
      'Limite de emails de Supabase superado (demasiados intentos de registro). ' +
      'Espera 30-60 minutos, o crea el usuario en Supabase > Authentication > Users > Add user ' +
      'y desactiva Confirm email mientras pruebas.'
    );
  }
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed')) {
    return (
      'No se pudo conectar con Supabase (Failed to fetch). Revisa internet, ' +
      'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY en Vercel y que el proyecto no este pausado.'
    );
  }
  if (m.includes('email address') && m.includes('invalid')) {
    return (
      'Supabase rechazo el correo. Activa Enable sign ups en Auth > Providers > Email ' +
      'y escribe el correo sin espacios.'
    );
  }
  if (m.includes('invalid login') || m.includes('invalid credentials')) {
    return 'Correo o contrasena incorrectos.';
  }
  if (m.includes('email not confirmed')) {
    return 'Confirma el correo o desactiva Confirm email en Supabase Auth.';
  }
  if (m.includes('signups not allowed') || m.includes('signup is disabled')) {
    return 'Registros deshabilitados. Activa Enable sign ups en Supabase Auth.';
  }
  if (m.includes('already registered') || m.includes('user already')) {
    return 'Ese correo ya esta registrado. Inicia sesion o restablece la clave.';
  }
  if (m.includes('permission') || m.includes('rls')) {
    return 'Permiso denegado (RLS).';
  }
  if (m.includes('function') && (m.includes('not found') || m.includes('does not exist'))) {
    return 'Falta la funcion register_clinic en Supabase.';
  }
  return message;
}
