import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Patient } from '../types';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => void;
  patient?: Patient;
}

function PatientModal({ isOpen, onClose, onSubmit, patient }: PatientModalProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    medical_history: {
      notes: '',
      allergies: [] as string[],
      conditions: [] as string[],
      medications: [] as string[],
    },
    dental_history: {
      notes: '',
      implants: [],
      treatments: [],
      lastCheckup: null,
    },
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    if (isOpen && patient) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        medical_history: patient.medical_history || {
          notes: '',
          allergies: [],
          conditions: [],
          medications: [],
        },
        dental_history: {
          notes: '',
          implants: [],
          treatments: [],
          lastCheckup: null,
        },
      });
    } else if (isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        medical_history: {
          notes: '',
          allergies: [],
          conditions: [],
          medications: [],
        },
        dental_history: {
          notes: '',
          implants: [],
          treatments: [],
          lastCheckup: null,
        },
      });
    }
  }, [isOpen, patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          allergies: [...formData.medical_history.allergies, newAllergy.trim()],
        },
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData({
      ...formData,
      medical_history: {
        ...formData.medical_history,
        allergies: formData.medical_history.allergies.filter((_, i) => i !== index),
      },
    });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          conditions: [...formData.medical_history.conditions, newCondition.trim()],
        },
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setFormData({
      ...formData,
      medical_history: {
        ...formData.medical_history,
        conditions: formData.medical_history.conditions.filter((_, i) => i !== index),
      },
    });
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setFormData({
        ...formData,
        medical_history: {
          ...formData.medical_history,
          medications: [...formData.medical_history.medications, newMedication.trim()],
        },
      });
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medical_history: {
        ...formData.medical_history,
        medications: formData.medical_history.medications.filter((_, i) => i !== index),
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {patient ? 'Modifier le patient' : 'Nouveau patient'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Historique médical */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Historique médical</h3>
            
            {/* Allergies */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Nouvelle allergie"
                />
                <button
                  type="button"
                  onClick={addAllergy}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.medical_history.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                    <span>{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Conditions médicales</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Nouvelle condition"
                />
                <button
                  type="button"
                  onClick={addCondition}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.medical_history.conditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                    <span>{condition}</span>
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Médicaments */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Médicaments</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Nouveau médicament"
                />
                <button
                  type="button"
                  onClick={addMedication}
                  className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.medical_history.medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                    <span>{medication}</span>
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes médicales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes médicales</label>
              <textarea
                value={formData.medical_history.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  medical_history: {
                    ...formData.medical_history,
                    notes: e.target.value,
                  },
                })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
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
              {patient ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientModal;
