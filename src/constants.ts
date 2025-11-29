
export const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRsTRhoswf3zopWO5PEusQsYdYglnUlWTX9HzFIvewpy4vED9fQbs9Z0V3EdQ-AGMGLlpmcs_LL_cP3/pub?gid=0&single=true&output=csv';

// This would ideally be fetched from a live API.
export const BCV_RATE = 242.79;

// Initial table to waiter assignments for first-time setup
export const INITIAL_TABLE_WAITER_ASSIGNMENTS: { [key: string]: string | null } = {
  '1': 'Carlos Rivas',
  '2': 'Ana Fuentes',
  '3': 'Luis Jimenez',
  '4': 'Carlos Rivas',
  '5': 'Sofia Gomez',
  '6': 'Ana Fuentes',
  '7': 'Pedro Castillo',
  '8': 'Sofia Gomez',
  '9': 'Luis Jimenez',
  '10': 'Pedro Castillo',
  '11': 'Carlos Rivas',
  '12': 'Ana Fuentes',
  '13': null,
  '14': 'Sofia Gomez',
  '15': 'Pedro Castillo',
  '16': null,
  '17': null,
  '18': 'Luis Jimenez',
  '19': 'Carlos Rivas',
  '20': 'Ana Fuentes',
};

// Initial list of waiters if none are in local storage
export const INITIAL_WAITERS: string[] = [
    'Carlos Rivas',
    'Ana Fuentes',
    'Luis Jimenez',
    'Sofia Gomez',
    'Pedro Castillo',
];
