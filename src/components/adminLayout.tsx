'use client';

import React from "react"

import {Link} from 'react-router-dom';
import { Settings, Users, Pill, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: 'odontologos' | 'servicios' | 'usuarios';
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const navItems = [
    { id: 'odontologos', label: 'Gestión de Doctores', icon: Users, href: '/admin/odontologos' },
    { id: 'servicios', label: 'Gestión de Servicios', icon: Pill, href: '/admin/servicios' },
    { id: 'usuarios', label: 'Gestión de Usuarios', icon: Settings, href: '/admin/usuarios' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-teal-100 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-teal-50 rounded-lg md:hidden transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-teal-600" /> : <Menu className="w-5 h-5 text-teal-600" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 bg-white border-r border-teal-100 hidden md:block md:w-64`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link key={item.id} to={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md'
                        : 'text-slate-700 hover:bg-teal-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-16 bottom-0 w-64 bg-white border-r border-teal-100 shadow-lg">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <Link key={item.id} to={item.href} onClick={() => setSidebarOpen(false)}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-md'
                            : 'text-slate-700 hover:bg-teal-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
