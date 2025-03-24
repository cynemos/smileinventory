import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Edit2,
  Loader2,
  Building2,
  Phone,
  Mail,
  FileText,
  List,
  Truck,
  ChevronsUpDown
} from 'lucide-react';
import { 
  getProducts, 
  getSuppliers,
  createProduct,
  createSupplier,
  updateSupplier,
  createInventoryMovement
} from '../lib/supabase';
import type { Product, Supplier, InventoryMovement } from '../types';
import ProductModal from '../components/ProductModal';
import SupplierModal from '../components/SupplierModal';
import InventoryMovementModal from '../components/InventoryMovementModal';
import { productCategories } from '../lib/productCategories';

type ViewMode = 'products' | 'suppliers';

function Inventory() {
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sortCategory, setSortCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, suppliersData] = await Promise.all([
        getProducts(),
        getSuppliers()
      ]);
      setProducts(productsData);
      setSuppliers(suppliersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createProduct(productData);
      await loadData();
      setShowProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleSupplierSubmit = async (supplierData: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, supplierData);
      } else {
        await createSupplier(supplierData);
      }
      await loadData();
      setShowSupplierModal(false);
      setSelectedSupplier(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleMovementSubmit = async (movementData: Omit<InventoryMovement, 'id' | 'created_at' | 'created_by'>) => {
    try {
      await createInventoryMovement(movementData);
      await loadData();
      setShowMovementModal(false);
      setSelectedProduct(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortCategory) return 0;
    if (a.category < b.category) {
      return sortCategory === 'asc' ? -1 : 1;
    }
    if (a.category > b.category) {
      return sortCategory === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
        <div className="flex items-center space-x-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('products')}
              className={`px-3 py-2 text-sm font-medium rounded-l-md flex items-center space-x-2 ${
                viewMode === 'products'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-300'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Produits</span>
            </button>
            <button
              onClick={() => setViewMode('suppliers')}
              className={`px-3 py-2 text-sm font-medium rounded-r-md flex items-center space-x-2 ${
                viewMode === 'suppliers'
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-white text-gray-700 hover:text-gray-900 border border-l-0 border-gray-300'
              }`}
            >
              <Truck className="h-4 w-4" />
              <span>Fournisseurs</span>
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setShowProductModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Produit
            </button>
            <button
              onClick={() => {
                setSelectedSupplier(null);
                setShowSupplierModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Fournisseur
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={viewMode === 'products' ? "Rechercher un produit..." : "Rechercher un fournisseur..."}
          className="ml-2 flex-1 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'products' ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center">
                    Catégorie
                    <button onClick={() => setSortCategory(sortCategory === 'asc' ? 'desc' : 'asc')}>
                      <ChevronsUpDown className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Package className="h-10 w-10 text-gray-500" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {product.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {product.inventory?.[0]?.quantity || 0} unités
                    </div>
                    {product.reorder_point >= (product.inventory?.[0]?.quantity || 0) && (
                      <div className="flex items-center text-amber-600 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Réapprovisionnement nécessaire
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {product.sale_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      Coût: {product.unit_cost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (product.inventory?.[0]?.quantity || 0) <= 0 ? 'bg-red-100 text-red-800' :
                      product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      product.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {(product.inventory?.[0]?.quantity || 0) <= 0 ? 'Rupture' :
                       product.status === 'ACTIVE' ? 'Actif' :
                       product.status === 'OUT_OF_STOCK' ? 'Rupture' :
                       'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowMovementModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                      title="Mouvement de stock"
                    >
                      {product.status === 'ACTIVE' ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fournisseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence client
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="h-10 w-10 text-gray-500" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {supplier.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {supplier.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1" />
                          <a href={`tel:${supplier.phone}`} className="hover:text-primary-600">
                            {supplier.phone}
                          </a>
                        </div>
                      )}
                      {supplier.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-4 w-4 mr-1" />
                          <a href={`mailto:${supplier.email}`} className="hover:text-primary-600">
                            {supplier.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {supplier.customer_reference && (
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="h-4 w-4 mr-1" />
                        {supplier.customer_reference}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setShowSupplierModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={selectedProduct || undefined}
      />

      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => {
          setShowSupplierModal(false);
          setSelectedSupplier(null);
        }}
        onSubmit={handleSupplierSubmit}
        supplier={selectedSupplier || undefined}
      />

      {selectedProduct && (
        <InventoryMovementModal
          isOpen={showMovementModal}
          onClose={() => {
            setShowMovementModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleMovementSubmit}
          product={selectedProduct}
        />
      )}
    </div>
  );
}

export default Inventory;
