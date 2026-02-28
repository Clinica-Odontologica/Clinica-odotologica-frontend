"use client";

import React from "react";

import { Calendar, User, Stethoscope, FileText } from "lucide-react";
import { useState } from "react";
import { ReceptionLayout } from "../components/receptionLayout";

export default function NuevoTurnoPage() {
  const [formData, setFormData] = useState({
    paciente: "",
    doctor: "",
    fecha: "",
    hora: "",
    tratamiento: "",
  });

  // Mock data
  const doctors = [
    { id: 1, name: "Dr. García López", specialty: "Odontología General" },
    { id: 2, name: "Dra. Martínez Ruiz", specialty: "Endodoncia" },
    { id: 3, name: "Dr. Fernández Pérez", specialty: "Cirugía Bucal" },
    { id: 4, name: "Dra. Rodríguez García", specialty: "Ortodoncia" },
  ];

  const patients = [
    { id: 1, name: "Juan Pérez García", dni: "12345678" },
    { id: 2, name: "Ana López Martínez", dni: "87654321" },
    { id: 3, name: "Carlos Ruiz Sánchez", dni: "45678912" },
    { id: 4, name: "Rosa Díaz López", dni: "11223344" },
  ];

  const treatments = [
    "Limpieza",
    "Revisión General",
    "Obturación",
    "Extracción",
    "Endodoncia",
    "Ortodoncia",
    "Blanqueamiento",
  ];

  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Turno creado:", formData);
  };

  return (
    <ReceptionLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Agendar Nuevo Turno
          </h2>
          <p className="text-slate-600 mt-1">
            Complete los campos para registrar un nuevo turno
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Seleccionar Paciente
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Buscar Paciente
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe nombre o DNI..."
                    value={formData.paciente}
                    onChange={(e) =>
                      setFormData({ ...formData, paciente: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>

                {/* Patient Autocomplete */}
                <div className="space-y-2">
                  {patients
                    .filter(
                      (p) =>
                        !formData.paciente ||
                        p.name
                          .toLowerCase()
                          .includes(formData.paciente.toLowerCase()) ||
                        p.dni.includes(formData.paciente),
                    )
                    .slice(0, 3)
                    .map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, paciente: patient.name })
                        }
                        className="w-full text-left p-3 rounded-lg border border-teal-100 hover:bg-teal-50 transition-colors"
                      >
                        <p className="font-medium text-slate-900 text-sm">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-600">
                          DNI: {patient.dni}
                        </p>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Doctor Selection */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Seleccionar Odontólogo
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, doctor: doctor.name })
                    }
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.doctor === doctor.name
                        ? "border-teal-500 bg-teal-50"
                        : "border-teal-100 bg-white hover:border-teal-300"
                    }`}
                  >
                    <p className="font-semibold text-slate-900 text-sm">
                      {doctor.name}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {doctor.specialty}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Fecha y Hora
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) =>
                      setFormData({ ...formData, fecha: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Hora
                  </label>
                  <select
                    value={formData.hora}
                    onChange={(e) =>
                      setFormData({ ...formData, hora: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
                  >
                    <option value="">Seleccionar hora</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Treatment */}
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Tipo de Tratamiento
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {treatments.map((treatment) => (
                  <button
                    key={treatment}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tratamiento: treatment })
                    }
                    className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.tratamiento === treatment
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-teal-100 bg-white text-slate-700 hover:border-teal-300"
                    }`}
                  >
                    {treatment}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-teal-100 p-6 shadow-sm sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Resumen del Turno
              </h3>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                  <p className="text-xs text-teal-600 uppercase font-semibold">
                    Paciente
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formData.paciente || "No seleccionado"}
                  </p>
                </div>

                <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-100">
                  <p className="text-xs text-cyan-600 uppercase font-semibold">
                    Odontólogo
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formData.doctor || "No seleccionado"}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 uppercase font-semibold">
                    Fecha y Hora
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formData.fecha
                      ? new Date(formData.fecha).toLocaleDateString("es-ES")
                      : "No definida"}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {formData.hora || "- -: - -"}
                  </p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 uppercase font-semibold">
                    Tratamiento
                  </p>
                  <p className="font-semibold text-slate-900 mt-1">
                    {formData.tratamiento || "No seleccionado"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-teal-100 space-y-2">
                <button
                  type="submit"
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg font-semibold transition-all"
                >
                  Confirmar Turno
                </button>
                <button
                  type="button"
                  className="w-full px-4 py-3 border border-teal-200 text-teal-700 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ReceptionLayout>
  );
}
