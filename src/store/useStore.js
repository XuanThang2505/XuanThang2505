import { useState, useCallback } from 'react';
import { INITIAL_PROJECTS, MEMBERS } from '../data/initialData';

const STORAGE_KEY = 'ppm_data_v2';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { projects: INITIAL_PROJECTS, members: MEMBERS };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

let _state = loadData();
let _listeners = [];

function notify() {
  _listeners.forEach(fn => fn({ ..._state }));
}

export function useStore() {
  const [state, setState] = useState(() => ({ ..._state }));

  const subscribe = useCallback((fn) => {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
  }, []);

  useState(() => {
    const unsub = subscribe(setState);
    return unsub;
  });

  const dispatch = useCallback((action) => {
    switch (action.type) {
      case 'ADD_PROJECT':
        _state = { ..._state, projects: [..._state.projects, action.payload] };
        break;
      case 'UPDATE_PROJECT':
        _state = {
          ..._state,
          projects: _state.projects.map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload } : p
          ),
        };
        break;
      case 'DELETE_PROJECT':
        _state = {
          ..._state,
          projects: _state.projects.filter(p => p.id !== action.payload),
        };
        break;
      case 'RESET':
        _state = { projects: INITIAL_PROJECTS, members: MEMBERS };
        break;
      default:
        return;
    }
    saveData(_state);
    notify();
  }, []);

  return { state, dispatch };
}
