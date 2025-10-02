const DB_KEY = 'crisp-db';

export const ensureFile = () => {
  if (!localStorage.getItem(DB_KEY)) {
    localStorage.setItem(DB_KEY, JSON.stringify({ candidates: [], sessions: {} }));
  }
};

export const readJson = () => {
  ensureFile();
  return JSON.parse(localStorage.getItem(DB_KEY) || '{}');
};

export const writeJson = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};
