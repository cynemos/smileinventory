import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Phone, Mail, Calendar, Loader2, AlertTriangle, Info, X } from 'lucide-react';
import { getPatients, createPatient, updatePatient } from '../lib/supabase';
import type { Patient } from '../types';
import PatientModal from '../components/PatientModal';

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showMedicalHistory, setShowMedicalHistory] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedPatient) {
        await updatePatient(selectedPatient.id, patientData);
      } else {
        await createPatient(patientData);
      }
      await loadPatients();
      setShowModal(false);
      setSelectedPatient(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.phone && patient.phone.includes(searchTerm))
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
        <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
        <button
          onClick={() => {
            setSelectedPatient(null);
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Patient
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
          placeholder="Rechercher un patient..."
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
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Historique médical
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Historique dentaire
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {patient.first_name} {patient.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Né(e) le {new Date(patient.date_of_birth).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-4 w-4 mr-1" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="h-4 w-4 mr-1" />
                      {patient.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {patient.medical_history?.allergies.length ? (
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {patient.medical_history.allergies.length} allergie(s)
                      </div>
                    ) : null}
                    <div className="text-gray-500">
                      {patient.medical_history?.conditions.length} condition(s)
                    </div>
                    <div className="text-gray-500">
                      {patient.medical_history?.medications.length} médicament(s)
                    </div>
                    <button
                      onClick={() => setShowMedicalHistory(patient)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-500">
                      {patient.dental_history?.implants?.length || 0} implant(s)
                    </div>
                    <div className="text-gray-500">
                      {patient.dental_history?.treatments?.length || 0} traitement(s)
                    </div>
                    {patient.dental_history?.lastCheckup && (
                      <div className="text-gray-500">
                        Dernière visite: {new Date(patient.dental_history.lastCheckup).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
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

      <PatientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedPatient(null);
        }}
        onSubmit={handleSubmit}
        patient={selectedPatient || undefined}
      />

      {showMedicalHistory && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Historique médical de {showMedicalHistory.first_name} {showMedicalHistory.last_name}</h2>
              <button onClick={() => setShowMedicalHistory(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">
                <strong className="text-black">Allergies</strong>
              </h3>
              {showMedicalHistory.medical_history?.allergies.length ? (
                <ul>
                  {showMedicalHistory.medical_history.allergies.map((allergy, index) => (
                    <li key={index} className="text-blue-500">{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-500">Aucune allergie enregistrée.</p>
              )}

              <h3 className="text-lg font-medium mb-2">
                <strong className="text-black">Conditions médicales</strong>
              </h3>
              {showMedicalHistory.medical_history?.conditions.length ? (
                <ul>
                  {showMedicalHistory.medical_history.conditions.map((condition, index) => (
                    <li key={index} className="text-blue-500">{condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-500">Aucune condition médicale enregistrée.</p>
              )}

              <h3 className="text-lg font-medium mb-2">
                <strong className="text-black">Médicaments</strong>
              </h3>
              {showMedicalHistory.medical_history?.medications.length ? (
                <ul>
                  {showMedicalHistory.medical_history.medications.map((medication, index) => (
                    <li key={index} className="text-blue-500">{medication}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-blue-500">Aucun médicament enregistré.</p>
              )}

              <h3 className="text-lg font-medium mb-2">
                <strong className="text-black">Notes médicales</strong>
              </h3>
              <p className="text-blue-500">{showMedicalHistory.medical_history?.notes || 'Aucune note médicale enregistrée.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
