import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package, AlertTriangle, Euro } from 'lucide-react';
import type { Treatment, Patient, Product, InventoryItem } from '../types';
import { getProducts, getInventoryItems } from '../lib/supabase';

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Treatment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  treatment?: Treatment;
  patients: Patient[];
}

function TreatmentModal({ isOpen, onClose, onSubmit, treatment, patients }: TreatmentModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'IMPLANT' as Treatment['type'],
    notes: '',
    cost: 0,
    products: [] as Array<{ product_id: string; quantity: number }>
  });
  const [selectedProduct, setSelectedProduct] = useState({
    product_id: '',
    quantity: 1
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (treatment) {
        setFormData({
          patient_id: treatment.patient_id,
          date: new Date(treatment.date).toISOString().split('T')[0],
          type: treatment.type,
          notes: treatment.notes || '',
          cost: treatment.cost,
          products: treatment.products?.map(p => ({
            product_id: p.product_id,
            quantity: p.quantity
          })) || []
        });
      } else {
        setFormData({
          patient_id: '',
          date: new Date().toISOString().split('T')[0],
          type: 'IMPLANT',
          notes: '',
          cost: 0,
          products: []
        });
      }
      setError(null);
    }
  }, [isOpen, treatment]);

  const loadData = async () => {
    try {
      const [productsData, inventoryData] = await Promise.all([
        getProducts(),
        getInventoryItems()
      ]);
      setProducts(productsData);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des produits');
    }
  };

  // Calcul du coût total basé sur les prix de vente (sale_price) des produits
  const calculateTotalCost = (selectedProducts: Array<{ product_id: string; quantity: number }>) => {
    return selectedProducts.reduce((total, selectedProduct) => {
      const product = products.find(p => p.id === selectedProduct.product_id);
      if (product) {
        // Utilisation du prix de vente (sale_price) pour le calcul
        const productCost = product.sale_price * selectedProduct.quantity;
        return total + productCost;
      }
      return total;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le stock disponible pour chaque produit
    const stockErrors: string[] = [];
    formData.products.forEach(product => {
      const productInfo = products.find(p => p.id === product.product_id);
      const stockItems = inventory.filter(item => item.product_id === product.product_id);
      const totalStock = stockItems.reduce((sum, item) => sum + item.quantity, 0);
      
      if (totalStock < product.quantity) {
        stockErrors.push(`Stock insuffisant pour ${productInfo?.name} (disponible: ${totalStock})`);
      }
    });

    if (stockErrors.length > 0) {
      setError(stockErrors.join('\n'));
      return;
    }

    // Calculer le coût total basé sur les prix de vente
    const totalCost = calculateTotalCost(formData.products);
    onSubmit({ ...formData, cost: totalCost });
  };

  const addProduct = () => {
    if (selectedProduct.product_id && selectedProduct.quantity > 0) {
      // Vérifier si le produit existe déjà
      const existingProduct = formData.products.find(p => p.product_id === selectedProduct.product_id);
      const newProducts = existingProduct
        ? formData.products.map(p =>
            p.product_id === selectedProduct.product_id
              ? { ...p, quantity: p.quantity + selectedProduct.quantity }
              : p
          )
        : [...formData.products, { ...selectedProduct }];

      // Recalculer le coût total avec les nouveaux produits
      const totalCost = calculateTotalCost(newProducts);
      
      setFormData({
        ...formData,
        products: newProducts,
        cost: totalCost
      });
      
      setSelectedProduct({
        product_id: '',
        quantity: 1
      });
      setError(null);
    }
  };

  const removeProduct = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    const totalCost = calculateTotalCost(newProducts);
    
    setFormData({
      ...formData,
      products: newProducts,
      cost: totalCost
    });
  };

  const getProductStock = (productId: string): number => {
    const stockItems = inventory.filter(item => item.product_id === productId);
    return stockItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getProductPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    return product ? product.sale_price : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {treatment ? 'Modifier le traitement' : 'Nouveau traitement'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type de traitement</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Treatment['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="IMPLANT">Implant</option>
              <option value="CLEANING">Nettoyage</option>
              <option value="EXTRACTION">Extraction</option>
              <option value="FILLING">Obturation</option>
              <option value="CROWN">Couronne</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Produits utilisés</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedProduct.product_id}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, product_id: e.target.value })}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">Sélectionner un produit</option>
                {products.map((product) => {
                  const stock = getProductStock(product.id);
                  const price = product.sale_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
                  return (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.category}) - {price} - Stock: {stock}
                    </option>
                  );
                })}
              </select>
              <input
                type="number"
                min="1"
                value={selectedProduct.quantity}
                onChange={(e) => setSelectedProduct({ ...selectedProduct, quantity: parseInt(e.target.value) })}
                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={addProduct}
                className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.products.map((product, index) => {
                const productDetails = products.find(p => p.id === product.product_id);
                const stock = getProductStock(product.product_id);
                const price = getProductPrice(product.product_id);
                const subtotal = price * product.quantity;
                const isStockWarning = stock < product.quantity;
                
                return (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm font-medium">
                          {productDetails?.name} - {product.quantity} unité(s)
                        </span>
                        <p className="text-xs text-gray-500">
                          Prix unitaire: {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          {' - '}
                          Sous-total: {subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                        {isStockWarning && (
                          <p className="text-xs text-amber-600 flex items-center mt-1">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Stock insuffisant (disponible: {stock})
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">Total</span>
              <span className="text-lg font-bold text-primary-600">
                {formData.cost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              {treatment ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TreatmentModal;
