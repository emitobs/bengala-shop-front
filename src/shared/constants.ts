export const APP_NAME = 'Bengala Max';
export const DEFAULT_CURRENCY = 'UYU';
export const DEFAULT_COUNTRY = 'UY';
export const DEFAULT_LOCALE = 'es-UY';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const ORDER_NUMBER_PREFIX = 'BM';

export const URUGUAY_DEPARTMENTS = [
  'Montevideo',
  'Canelones',
  'Maldonado',
  'Salto',
  'Paysandú',
  'Rivera',
  'Colonia',
  'San José',
  'Soriano',
  'Cerro Largo',
  'Tacuarembó',
  'Rocha',
  'Florida',
  'Lavalleja',
  'Durazno',
  'Artigas',
  'Río Negro',
  'Treinta y Tres',
  'Flores',
] as const;

export const URUGUAY_CITIES: Record<string, string[]> = {
  'Montevideo': ['Montevideo'],
  'Canelones': ['Las Piedras', 'Ciudad de la Costa', 'Pando', 'La Paz', 'Progreso', 'Santa Lucía', 'Canelones', 'Sauce', 'Toledo', 'Barros Blancos', 'Salinas', 'Solymar', 'Shangrilá', 'Atlántida', 'Parque del Plata'],
  'Maldonado': ['Maldonado', 'Punta del Este', 'San Carlos', 'Pan de Azúcar', 'Piriápolis', 'Aiguá'],
  'Salto': ['Salto', 'Constitución', 'Belén'],
  'Paysandú': ['Paysandú', 'Guichón', 'Quebracho'],
  'Rivera': ['Rivera', 'Tranqueras', 'Vichadero', 'Minas de Corrales'],
  'Colonia': ['Colonia del Sacramento', 'Carmelo', 'Juan Lacaze', 'Nueva Helvecia', 'Rosario', 'Nueva Palmira', 'Tarariras'],
  'San José': ['San José de Mayo', 'Ciudad del Plata', 'Libertad', 'Ecilda Paullier', 'Delta del Tigre'],
  'Soriano': ['Mercedes', 'Dolores', 'Cardona', 'José Enrique Rodó'],
  'Cerro Largo': ['Melo', 'Río Branco', 'Fraile Muerto'],
  'Tacuarembó': ['Tacuarembó', 'Paso de los Toros', 'San Gregorio de Polanco'],
  'Rocha': ['Rocha', 'Chuy', 'Castillos', 'Lascano', 'La Paloma', 'La Pedrera'],
  'Florida': ['Florida', 'Sarandí Grande', 'Casupá', 'Fray Marcos'],
  'Lavalleja': ['Minas', 'José Pedro Varela', 'Solís de Mataojo'],
  'Durazno': ['Durazno', 'Sarandí del Yí'],
  'Artigas': ['Artigas', 'Bella Unión', 'Tomás Gomensoro', 'Baltasar Brum'],
  'Río Negro': ['Fray Bentos', 'Young', 'San Javier', 'Nuevo Berlín'],
  'Treinta y Tres': ['Treinta y Tres', 'Vergara', 'Santa Clara de Olimar'],
  'Flores': ['Trinidad', 'Ismael Cortinas'],
};

export const PASSWORD_MIN_LENGTH = 8;
export const RATING_MIN = 1;
export const RATING_MAX = 5;
