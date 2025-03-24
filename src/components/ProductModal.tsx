import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../types';
import { getSuppliers, getProducts } from '../lib/supabase';
import { productCategories } from '../lib/productCategories';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  product?: Product;
}

function ProductModal({ isOpen, onClose, onSubmit, product }: ProductModalProps) {
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    description: '',
    supplier_id: null as string | null,
    unit_cost: 0,
    sale_price: 0,
    reorder_point: 0,
    reorder_quantity: 0,
    storage_location: '',
    status: 'ACTIVE' as const,
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (product) {
        setFormData({
          sku: product.sku,
          name: product.name,
          category: product.category,
          description: product.description || '',
          supplier_id: product.supplier_id,
          unit_cost: product.unit_cost,
          sale_price: product.sale_price,
          reorder_point: product.reorder_point,
          reorder_quantity: product.reorder_quantity,
          storage_location: product.storage_location || '',
          status: product.status,
        });
      } else {
        setFormData({
          sku: '',
          name: '',
          category: '',
          description: '',
          supplier_id: null,
          unit_cost: 0,
          sale_price: 0,
          reorder_point: 0,
          reorder_quantity: 0,
          storage_location: '',
          status: 'ACTIVE',
        });
      }
      setSkuError(null);
    }
  }, [isOpen, product]);

  const loadData = async () => {
    try {
      const [suppliersData, productsData] = await Promise.all([
        getSuppliers(),
        getProducts()
      ]);
      setSuppliers(suppliersData);
      setExistingProducts(productsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const validateSku = (sku: string) => {
    if (!sku) return;
    const existingProduct = existingProducts.find(p => 
      p.sku === sku && (!product || p.id !== product.id)
    );
    if (existingProduct) {
      setSkuError('Ce SKU existe déjà');
    } else {
      setSkuError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (skuError) return;
    onSubmit(formData);
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = e.target.value;
    setFormData({ ...formData, sku: newSku });
    validateSku(newSku);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = productCategories.find(cat => cat.id === e.target.value);
    if (selectedCategory) {
      setFormData({
        ...formData,
        category: selectedCategory.name,
        description: selectedCategory.description,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={handleSkuChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 ${
                  skuError ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {skuError && (
                <p className="mt-1 text-sm text-red-600">{skuError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              value={productCategories.find(cat => cat.name === formData.category)?.id || ''}
              onChange={handleCategoryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Sélectionner une catégorie</option>
              {productCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
            <select
              value={formData.supplier_id || ''}
              onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Sélectionner un fournisseur</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Coût unitaire</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prix de vente</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.sale_price}
                onChange={(e) => setFormData({ ...formData, sale_price: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seuil de réapprovisionnement</label>
              <input
                type="number"
                required
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantité de réapprovisionnement</label>
              <input
                type="number"
                required
                min="0"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Emplacement de stockage</label>
            <input
              type="text"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Product['status'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
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
              disabled={!!skuError}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                skuError ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {product ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
