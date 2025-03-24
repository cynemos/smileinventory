import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Package, AlertTriangle, ArrowRight, Loader2, Building2, Phone, Mail, FileText, CheckCircle } from 'lucide-react';
import { fetchLowStockProducts } from '../store/slices/alertsSlice';
import type { AppDispatch, RootState } from '../store';
import { Link } from 'react-router-dom';

function Alerts() {
  const dispatch = useDispatch<AppDispatch>();
  const { lowStockProducts, loading, error } = useSelector((state: RootState) => state.alerts);
  const [orderDates, setOrderDates] = useState<{ [productId: string]: string }>({});

  useEffect(() => {
    dispatch(fetchLowStockProducts());
  }, [dispatch]);

  const handleOrderClick = (productId: string) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setOrderDates(prev => ({ ...prev, [productId]: formattedDate }));
  };

  const getIconColor = (productId: string) => {
    return orderDates[productId] ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Alertes</h1>

      {lowStockProducts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Aucune alerte à afficher</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {lowStockProducts.map((product) => {
            const totalQuantity = product.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const deficit = product.reorder_point - totalQuantity;
            const supplier = product.supplier;
            
            return (
              <div key={product.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {product.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-500">
                        <p>SKU: {product.sku}</p>
                        <p>Catégorie: {product.category}</p>
                        <div className="flex items-center mt-2 text-amber-600">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <span>
                            Stock actuel: {totalQuantity} unité(s) 
                            {' - '}
                            Seuil de réapprovisionnement: {product.reorder_point} unité(s)
                            {' - '}
                            Déficit: {deficit} unité(s)
                          </span>
                        </div>
                        {supplier && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center mb-2">
                              <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="font-medium">{supplier.name}</span>
                            </div>
                            {supplier.phone && (
                              <div className="flex items-center text-sm mb-1">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <a href={`tel:${supplier.phone}`} className="text-primary-600 hover:text-primary-800">
                                  {supplier.phone}
                                </a>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center text-sm mb-1">
                                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                <a href={`mailto:${supplier.email}`} className="text-primary-600 hover:text-primary-800">
                                  {supplier.email}
                                </a>
                              </div>
                            )}
                            {supplier.customer_reference && (
                              <div className="flex items-center text-sm">
                                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                                <span>Réf. client: {supplier.customer_reference}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <button
                      onClick={() => handleOrderClick(product.id)}
                      className={getIconColor(product.id)}
                    >
                      <CheckCircle className="h-6 w-6" />
                    </button>
                    {orderDates[product.id] && (
                      <div className="mt-1 text-xs text-gray-500">
                        Commandé le: {orderDates[product.id]}
                      </div>
                    )}
                    <Link
                      to="/inventory"
                      className="flex items-center text-primary-600 hover:text-primary-900 mt-2"
                    >
                      <span className="text-sm font-medium">Voir l'inventaire</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Alerts;
