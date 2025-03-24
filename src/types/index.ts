export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  medical_history: {
    notes: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
  } | null;
  dental_history: {
    notes: string;
    implants: Array<{
      position: string;
      date: string;
      type: string;
      surgeon: string;
    }>;
    treatments: Array<{
      date: string;
      description: string;
      cost: number;
    }>;
    lastCheckup: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  customer_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string | null;
  supplier_id: string;
  unit_cost: number;
  sale_price: number;
  reorder_point: number;
  reorder_quantity: number;
  storage_location: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  created_at: string;
  updated_at: string;
  supplier?: {
    name: string;
  };
  inventory?: Array<{
    quantity: number;
    expiration_date: string | null;
  }>;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  batch_number: string;
  quantity: number;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    name: string;
    sku: string;
  };
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  type: 'IN' | 'OUT';
  quantity: number;
  batch_number: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  created_by: string;
  product?: {
    name: string;
    sku: string;
  };
}

export interface Treatment {
  id: string;
  patient_id: string;
  date: string;
  type: 'IMPLANT' | 'CLEANING' | 'EXTRACTION' | 'FILLING' | 'CROWN' | 'OTHER';
  notes: string | null;
  cost: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  patient?: {
    first_name: string;
    last_name: string;
  };
  products?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    product: {
      name: string;
      sku: string;
      category: string;
    };
  }>;
}

export interface DashboardStats {
  todayPatients: number;
  newPatients: number;
  lowStockProducts: number;
  revenueLastThirtyDays: number;
  patientStats: {
    total: number;
    withImplants: number;
    withAllergies: number;
  };
}
