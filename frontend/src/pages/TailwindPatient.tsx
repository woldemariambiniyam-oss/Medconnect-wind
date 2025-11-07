import React from 'react';
import TailwindLayout from '../components/TailwindLayout';

const TailwindPatient: React.FC = () => {
  return (
    <TailwindLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Patient Dashboard (Tailwind)</h1>
        <p className="text-gray-600">This is a lightweight Tailwind demo page for patients.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-medium">Appointments</h2>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-medium">Prescriptions</h2>
            <p className="text-3xl font-bold mt-2">5</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-medium">Payments</h2>
            <p className="text-3xl font-bold mt-2">$120</p>
          </div>
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-lg font-medium">Notifications</h2>
            <p className="text-3xl font-bold mt-2">2</p>
          </div>
        </div>

      </div>
    </TailwindLayout>
  );
};

export default TailwindPatient;
