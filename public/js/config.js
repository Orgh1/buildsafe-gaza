// Shared domain enums — kept in sync with src/config.js on the server
window.BSG = window.BSG || {};
window.BSG.enums = {
  BUILDING_TYPES: ['Residential', 'Commercial', 'Industrial', 'Public', 'Mixed-use', 'Other'],
  DAMAGE_TYPES: ['Structural', 'Partial collapse', 'Cracks', 'Fire', 'Water', 'Facade', 'Other'],
  SEVERITY_LEVELS: ['Minor', 'Moderate', 'Severe', 'Critical'],
  HABITABILITY: ['Habitable', 'Conditional', 'Uninhabitable'],
};
