import { getSupabase } from './client';

/** Lecturas sobre tablas existentes. No altera esquema. */

export async function listPatients(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listDoctors(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listAppointments(opts?: {
  from?: string;
  to?: string;
  limit?: number;
}) {
  const supabase = getSupabase();
  let q = supabase.from('appointments').select('*');
  if (opts?.from) q = q.gte('starts_at', opts.from);
  if (opts?.to) q = q.lte('starts_at', opts.to);
  const { data, error } = await q
    .order('starts_at', { ascending: true })
    .limit(opts?.limit ?? 100);
  if (error) throw error;
  return data ?? [];
}

export async function listBudgets(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listInvoices(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listReceipts(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listInventoryItems(limit = 100) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listLabOrders(limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('lab_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
