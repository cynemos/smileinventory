import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, User, Package, Euro, Edit2, Loader2, AlertTriangle } from 'lucide-react';
import { getPatients, getTreatments, createTreatment, updateTreatment } from '../lib/supabase';
import type { Patient, Treatment } from '../types';
import TreatmentModal from '../components/TreatmentModal';

function Treatments() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [treatmentsData, patientsData] = await Promise.all([
        getTreatments(),
        getPatients()
      ]);
      setTreatments(treatmentsData);
      setPatients(patientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (treatmentData: Omit<Treatment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      if (selectedTreatment) {
        await updateTreatment(selectedTreatment.id, treatmentData);
      } else {
        await createTreatment(treatmentData);
      }
      await loadData();
      setShowModal(false);
      setSelectedTreatment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const filteredTreatments = treatments.filter(treatment => {
    const patientName = `${treatment.patient?.first_name} ${treatment.patient?.last_name}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return patientName.includes(searchLower) ||
           treatment.type.toLowerCase().includes(searchLower) ||
           treatment.notes?.toLowerCase().includes(searchLower);
  });

  const treatmentTypeTranslations: { [key: string]: string } = {
    'IMPLANT': 'Implant',
    'CLEANING': 'Nettoyage',
    'EXTRACTION': 'Extraction',
    'FILLING': 'Obturation',
    'CROWN': 'Couronne'
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Traitements</h1>
        <button
          onClick={() => {
            setSelectedTreatment(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Traitement
        </button>
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
          placeholder="Rechercher un traitement..."
          className="ml-2 flex-1 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produits utilisés
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coût
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTreatments.map((treatment) => (
              <tr key={treatment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {new Date(treatment.date).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {treatment.patient?.first_name} {treatment.patient?.last_name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    treatment.type === 'IMPLANT' ? 'bg-blue-100 text-blue-800' :
                    treatment.type === 'CLEANING' ? 'bg-green-100 text-green-800' :
                    treatment.type === 'EXTRACTION' ? 'bg-red-100 text-red-800' :
                    treatment.type === 'FILLING' ? 'bg-yellow-100 text-yellow-800' :
                    treatment.type === 'CROWN' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {treatmentTypeTranslations[treatment.type] || treatment.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {treatment.products?.map((product) => (
                      <div key={product.id} className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1" />
                        {product.product.name} ({product.quantity})
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Euro className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {treatment.cost.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedTreatment(treatment);
                      setShowModal(true);
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

      <TreatmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTreatment(null);
        }}
        onSubmit={handleSubmit}
        treatment={selectedTreatment || undefined}
        patients={patients}
      />
    </div>
  );
}

export default Treatments;
