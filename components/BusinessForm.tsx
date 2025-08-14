import React, { useState } from 'react';
import { FormData } from '../types';

interface BusinessFormProps {
  initialData: FormData;
  onSubmit: (formData: FormData) => void;
}

const BusinessForm: React.FC<BusinessFormProps> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSubmit(formData);
  };

  const formFields = [
    { name: 'businessName', label: 'Nama Klien (Opsional)', type: 'text', placeholder: 'Contoh: PT Klien Sejahtera' },
    { name: 'industry', label: 'Industri Klien', type: 'text', placeholder: 'Contoh: Perbankan, FMCG, Edukasi', required: true },
    { name: 'companySize', label: 'Ukuran Perusahaan Klien', type: 'select', options: ['Startup (< 10 Karyawan)', 'Kecil (10-50 Karyawan)', 'Menengah (51-250 Karyawan)', 'Besar (> 250 Karyawan)'], required: true },
    { name: 'focusArea', label: 'Area Fokus Layanan', type: 'select', options: ['Pusat Penilaian (Assessment Center)', 'Tes Psikologi (Psychological Test)', 'Pelatihan & Pengembangan (Training & Development)', 'Pencarian Eksekutif (Executive Search)', 'Konseling & Pembinaan (Counseling & Coaching)'], required: true },
    { name: 'challenge', label: 'Jelaskan Brief atau Tantangan Klien', type: 'textarea', placeholder: 'Jelaskan problem statement atau tujuan proyek dari brief klien. Contoh: "Klien ingin merombak proses rekrutmen untuk mengurangi turnover di level manajerial"', required: true },
  ];

  return (
    <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-2xl shadow-2xl animate-fade-in">
      <h2 className="text-2xl font-bold text-white mb-2">Detail Proyek Klien</h2>
      <p className="text-slate-400 mb-6">Informasi yang detail akan menghasilkan draf modul yang lebih relevan dan berkualitas.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map(field => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-slate-300 mb-2">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                rows={5}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleChange}
                required={field.required}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
              >
                {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name as keyof FormData]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full bg-slate-700 border-slate-600 text-white rounded-md p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-amber-400/50 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? 'Menyusun Draf...' : 'Hasilkan Modul Proyek'}
        </button>
      </form>
    </div>
  );
};

export default BusinessForm;