export const routes = {

  // Recepcionist Routes
  recepcion: "/reception",
  recepcion_nuevos_turnos: "/reception/turnos/nuevo",
  recepcion_pacientes: "/reception/pacientes",




  doctor: "/agenda",
  admin: "/dashboard",

  NotFound: "*",

  // Public - Auth
  login: "/",

  //Admin Pages
    dashboard_profile: "/dashboard/profile",


  
  // Historia Clinica
  dashboard_historia_clinica: "/dashboard/historia-clinica",
  dashboard_historia_clinica_paciente: "/dashboard/historia-clinica/paciente/:id",
  dashboard_historia_clinica_paciente_nueva: "/dashboard/historia-clinica/paciente/nuevo",
  dashboard_historia_clinica_paciente_edit: "/dashboard/historia-clinica/paciente/edit/:id",

  // Turnos Management
  dashboard_turnos: "/dashboard/turnos",
  dashboard_turno: "/dashboard/turno/:id",
  dashboard_turno_new: "/dashboard/turno/nuevo",
  dashboard_turno_edit: "/dashboard/turno/edit/:id",

  // Users Management
  dashboard_users: "/dashboard/usuarios",
  dashboard_user: "/dashboard/usuario/:id",
  dashboard_user_new: "/dashboard/usuario/nuevo",
  dashboard_user_edit: "/dashboard/usuario/edit/:id",

  // Doctors Management
  dashboard_odontologos: "/dashboard/odontologos",
  dashboard_odontologo: "/dashboard/odontologo/:id",
  dashboard_odontologo_new: "/dashboard/odontologo/nuevo",
  dashboard_odontologo_edit: "/dashboard/odontologo/edit/:id",
  
  // Services Management
  dashboard_servicios: "/dashboard/servicios",
  dashboard_servicio: "/dashboard/servicio/:id",
  dashboard_servicio_new: "/dashboard/servicio/nuevo",
  dashboard_servicio_edit: "/dashboard/servicio/edit/:id",

  // Patients Management
  dashboard_pacientes: "/dashboard/pacientes",
};
