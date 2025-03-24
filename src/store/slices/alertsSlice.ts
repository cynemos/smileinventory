import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProducts } from '../../lib/supabase';
import type { Product } from '../../types';

interface AlertsState {
  lowStockProducts: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  lowStockProducts: [],
  loading: false,
  error: null,
};

export const fetchLowStockProducts = createAsyncThunk(
  'alerts/fetchLowStockProducts',
  async () => {
    const products = await getProducts();
    return products.filter(product => {
      const totalQuantity = product.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return totalQuantity <= product.reorder_point;
    });
  }
);

const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockProducts = action.payload;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Une erreur est survenue';
      });
  },
});

export default alertsSlice.reducer;
