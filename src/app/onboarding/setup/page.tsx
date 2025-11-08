'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingSetupPage() {
  const [formData, setFormData] = useState({
    parentName: '',
    email: '',
    notificationsEnabled: true,
  });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would typically save the data to your backend
    console.log('Form data:', formData);
    router.push('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-dark-blue mb-8 text-center">
          הגדרת חשבון הורה
        </h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="parentName" className="block text-lg font-medium text-gray-700 mb-2">
                שם ההורה
              </label>
              <input
                type="text"
                id="parentName"
                name="parentName"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                value={formData.parentName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
                כתובת דוא״ל
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notificationsEnabled"
                name="notificationsEnabled"
                className="h-5 w-5 text-accent-green rounded border-gray-300 focus:ring-accent-blue ml-2"
                checked={formData.notificationsEnabled}
                onChange={handleChange}
              />
              <label htmlFor="notificationsEnabled" className="text-lg text-gray-700">
                אפשר התראות
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-dark-blue text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-colors mt-8"
            >
              המשך ללוח הבקרה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}