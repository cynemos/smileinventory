import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import type { Patient, Supplier, Product, InventoryItem, InventoryMovement, DashboardStats, Treatment } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Patients
export const getPatients = async () => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPatient = async (id: string) => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const createPatient = async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
  // Nettoyer les données avant l'envoi
  const cleanedPatient = {
    ...patient,
    date_of_birth: patient.date_of_birth || null,
    email: patient.email || null,
    phone: patient.phone || null,
    medical_history: patient.medical_history || {
      notes: '',
      allergies: [],
      conditions: [],
      medications: []
    },
    dental_history: patient.dental_history || {
      notes: '',
      implants: [],
      treatments: [],
      lastCheckup: null
    }
  };

  const { data, error } = await supabase
    .from('patients')
    .insert([cleanedPatient])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePatient = async (id: string, patient: Partial<Patient>) => {
  // Nettoyer les données avant l'envoi
  const cleanedPatient = {
    ...patient,
    date_of_birth: patient.date_of_birth || null,
    email: patient.email || null,
    phone: patient.phone || null
  };

  const { data, error } = await supabase
    .from('patients')
    .update(cleanedPatient)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Suppliers
export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
};

export const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplier])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSupplier = async (id: string, supplier: Partial<Supplier>) => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      supplier:suppliers(name, phone, email, customer_reference),
      inventory:inventory_items(quantity, expiration_date)
    `)
    .order('name');
  if (error) throw error;
  return data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();
  if (error) throw error;

  // After creating a product, create an initial inventory item
  if (data) {
    const initialInventoryItem = {
      product_id: data.id,
      batch_number: 'INITIAL',
      quantity: 0,
      expiration_date: null,
    };

    await createInventoryItem(initialInventoryItem);
  }

  return data;
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Inventory Items
export const getInventoryItems = async () => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(`
      *,
      product:products(name, sku)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Inventory Movements
export const createInventoryMovement = async (movement: Omit<InventoryMovement, 'id' | 'created_at' | 'created_by'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert([{ ...movement, created_by: user.id }])
    .select()
    .single();

  if (error) throw error;

  // Update inventory quantity
  const { data: inventoryItem, error: inventoryError } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('product_id', movement.product_id)
    .single();

  if (inventoryError) throw inventoryError;

  let newQuantity = inventoryItem.quantity;

  if (movement.type === 'IN') {
    newQuantity += movement.quantity;
  } else if (movement.type === 'OUT') {
    newQuantity -= movement.quantity;
  }

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({ quantity: newQuantity })
    .eq('product_id', movement.product_id);

  if (updateError) throw updateError;

  // Update product status if quantity is zero
  if (newQuantity <= 0) {
    const { error: productUpdateError } = await supabase
      .from('products')
      .update({ status: 'OUT_OF_STOCK' })
      .eq('id', movement.product_id);

    if (productUpdateError) {
      console.error("Error updating product status:", productUpdateError);
    }
  } else {
     const { error: productUpdateError } = await supabase
      .from('products')
      .update({ status: 'ACTIVE' })
      .eq('id', movement.product_id);

    if (productUpdateError) {
      console.error("Error updating product status:", productUpdateError);
    }
  }

  return data;
};

export const getInventoryMovements = async (productId?: string) => {
  let query = supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(name, sku),
      created_by:users(email)
    `)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Treatments
export const getTreatments = async () => {
  const { data, error } = await supabase
    .from('treatments')
    .select(`
      *,
      patient:patients(first_name, last_name),
      products:treatment_products(
        id,
        product_id,
        quantity,
        product:products(name, sku, category)
      )
    `)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
};

export const createTreatment = async (treatment: Omit<Treatment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'products'> & { products: { product_id: string; quantity: number; }[] }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // First, create the treatment
  const { data, error } = await supabase
    .from('treatments')
    .insert([{
      patient_id: treatment.patient_id,
      date: treatment.date,
      type: treatment.type,
      notes: treatment.notes,
      cost: treatment.cost,
      created_by: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating treatment:", error);
    throw error;
  }

  // If treatment creation is successful, proceed to create treatment_products
  if (data && treatment.products && treatment.products.length > 0) {
    const treatmentProducts = treatment.products.map(product => ({
      treatment_id: data.id,
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    const { error: treatmentProductsError } = await supabase
      .from('treatment_products')
      .insert(treatmentProducts);

    if (treatmentProductsError) {
      console.error("Error creating treatment_products:", treatmentProductsError);
      throw treatmentProductsError;
    }
  }

  return data;
};

export const updateTreatment = async (id: string, treatment: Omit<Treatment, 'products'> & { products: { product_id: string; quantity: number; }[] }) => {
  const { products, ...treatmentData } = treatment;

  const { data, error } = await supabase
    .from('treatments')
    .update(treatmentData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Update treatment_products
  if (products && products.length > 0) {
    // Delete existing treatment_products
    const { error: deleteError } = await supabase
      .from('treatment_products')
      .delete()
      .eq('treatment_id', id);

    if (deleteError) {
      console.error("Error deleting treatment_products:", deleteError);
      throw deleteError;
    }

    // Insert new treatment_products
    const treatmentProducts = products.map(product => ({
      treatment_id: id,
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    const { error: insertError } = await supabase
      .from('treatment_products')
      .insert(treatmentProducts);

    if (insertError) {
      console.error("Error inserting treatment_products:", insertError);
      throw insertError;
    }
  }

  return data;
};

// Dashboard Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  // Patients du jour (on récupère tous les patients et on filtre côté client)
  const { data: allPatients } = await supabase
    .from('patients')
    .select('dental_history, medical_history, created_at');

  const todayPatients = allPatients?.filter(patient => {
    const lastCheckup = patient.dental_history?.lastCheckup;
    if (!lastCheckup) return false;
    
    const checkupDate = new Date(lastCheckup);
    return checkupDate >= today && checkupDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
  }) || [];

  // Nouveaux patients (30 derniers jours)
  const { data: newPatients } = await supabase
    .from('patients')
    .select('*')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Produits en rupture de stock
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select(`
      *,
      inventory:inventory_items(quantity)
    `)
    .eq('status', 'ACTIVE');

  // Calculs
  const lowStockCount = lowStockProducts?.filter(product => {
    const totalQuantity = product.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    return totalQuantity <= product.reorder_point;
  }).length || 0;

  // Récupérer les traitements des 30 derniers jours
  const { data: treatments } = await supabase
    .from('treatments')
    .select('*')
    .gte('date', thirtyDaysAgo.toISOString());

  // Calcul du chiffre d'affaires
  const revenue = treatments?.reduce((total, treatment) => total + (treatment.cost || 0), 0) || 0;

  return {
    todayPatients: todayPatients.length,
    newPatients: newPatients ? newPatients.length : 0,
    lowStockProducts: lowStockCount,
    revenueLastThirtyDays: revenue,
    patientStats: {
      total: allPatients?.length || 0,
      withImplants: allPatients?.filter(p => (p.dental_history?.implants || []).length > 0).length || 0,
      withAllergies: allPatients?.filter(p => (p.medical_history?.allergies || []).length > 0).length || 0,
    },
  };
};
