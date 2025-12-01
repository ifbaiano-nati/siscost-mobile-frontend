import React, { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { IBeach, IBeachEvaluation, IBeachType, IMethodology } from '../types/beach.d';
import { AxiosResponse } from 'node_modules/axios/index.cjs';
import { useAuth } from './AuthContext';

// Usar tipos do arquivo de tipos
type Beach = IBeach;
type BeachType = IBeachType;
type Methodology = IMethodology;

// Interface para Evaluation baseada na estrutura real da API
interface Evaluation {
  id: number;
  id_user: number;
  created_at: string;
  vl_value: number;
  id_beach: number;
  id_methodologie: number;
  json_data: object;
}

interface DataContextData {
  // Arrays para iterações
  beaches: Beach[];
  evaluations: IBeachEvaluation[];
  methodologies: IMethodology[];
  beachTypes: IBeachType[];
  
  // Maps para acesso rápido por ID
  beachesMap: Map<number, Beach>;
  evaluationsMap: Map<number, IBeachEvaluation>;
  methodologiesMap: Map<number, Methodology>;
  beachTypesMap: Map<number, BeachType>;  
  loading: boolean;
  
  // Funções de busca
  getBeachById: (id: number) => Beach | undefined;
  getBeachTypeById: (id: number) => IBeachType | undefined;
  getEvaluationById: (id: number) => IBeachEvaluation | undefined;
  getMethodologyById: (id: number) => IMethodology | undefined;
  
  // Funções de busca por relacionamento
  getEvaluationsByBeachId: (beachId: number) => IBeachEvaluation[];
  getEvaluationsByMethodologyId: (methodologyId: number) => IBeachEvaluation[];
  
  // Funções de fetch
  fetchBeaches: () => Promise<void>;
  fetchEvaluations: () => Promise<void>;
  fetchMethodologies: () => Promise<void>;
  fetchBeachTypes: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextData>({} as DataContextData);

export function DataProvider({ children }: { children: ReactNode }) {
  const [beaches, setBeaches] = useState<Beach[]>([]);
  const [evaluations, setEvaluations] = useState<IBeachEvaluation[]>([]);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [beachTypes, setBeachTypes] = useState<BeachType[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  // Criar Maps a partir dos arrays usando useMemo para performance
  // Com verificações de segurança
  const beachesMap = useMemo(() => {
    const map = new Map<number, Beach>();
    if (Array.isArray(beaches)) {
      beaches.forEach((beach) => {
        if (beach && typeof beach === 'object' && 'id' in beach) {
          map.set(beach.id, beach);
        }
      });
    }
    return map;
  }, [beaches]);

  const evaluationsMap = useMemo(() => {
    const map = new Map<number, IBeachEvaluation>();
    if (Array.isArray(evaluations)) {
      evaluations.forEach((evaluation) => {
        if (evaluation && typeof evaluation === 'object' && 'id' in evaluation) {
          map.set(evaluation.id, evaluation);
        }
      });
    }
    return map;
  }, [evaluations]);

  const methodologiesMap = useMemo(() => {
    const map = new Map<number, Methodology>();
    if (Array.isArray(methodologies)) {
      methodologies.forEach((methodology) => {
        if (methodology && typeof methodology === 'object' && 'id' in methodology) {
          map.set(methodology.id, methodology);
        }
      });
    }
    return map;
  }, [methodologies]);

  const beachTypesMap = useMemo(() => {
    const map = new Map<number, BeachType>();
    if (Array.isArray(beachTypes)) {
      beachTypes.forEach((beachType) => {
        if (beachType && typeof beachType === 'object' && 'id' in beachType) {
          map.set(beachType.id, beachType);
        }
      });
    }
    return map;
  }, [beachTypes]);

  // Funções helper para buscar por ID
  const getBeachById = (id: number): Beach | undefined => {
    return beachesMap.get(id);
  };

  const getEvaluationById = (id: number): IBeachEvaluation | undefined => {
    return evaluationsMap.get(id);
  };

  const getMethodologyById = (id: number): Methodology | undefined => {
    return methodologiesMap.get(id);
  };

  const getBeachTypeById = (id: number): BeachType | undefined => {
    return beachTypesMap.get(id);
  };

  // Funções helper para buscar por relacionamento
  const getEvaluationsByBeachId = (beachId: number): IBeachEvaluation[] => {
    if (!Array.isArray(evaluations)) {
      return [];
    }
    return evaluations.filter((evaluation) => 
      evaluation && 
      typeof evaluation === 'object' && 
      evaluation.id_beach === beachId
    );
  };

  const getEvaluationsByMethodologyId = (methodologyId: number): IBeachEvaluation[] => {
    if (!Array.isArray(evaluations)) {
      return [];
    }
    return evaluations.filter((evaluation) => 
      evaluation && 
      typeof evaluation === 'object' && 
      evaluation.id_metodologie === methodologyId
    );
  };

  async function fetchBeaches() {
    try {
      setLoading(true);
  
      const data = await api.getBeaches(); // agora já é IBeach[]
      setBeaches(data as Beach[]);
  
    } catch (error) {
      console.error('Error fetching beaches:', error);
      setBeaches([]);
    } finally {
      setLoading(false);
    }
  }
  

  async function fetchEvaluations() {
    try {
      setLoading(true);
      const data = await api.getEvaluations();
      setEvaluations(data);
    } catch {
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  }
  

  async function fetchMethodologies() {
    try {
      setLoading(true);
      const data = await api.getMethodologies();
      setMethodologies(data);
    } catch {
      setMethodologies([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBeachTypes() {
    try {
      setLoading(true);
      const data = await api.getBeachTypes();
      setBeachTypes(data);
    } catch {
      setBeachTypes([]);
    } finally {
      setLoading(false);
    }
  }

  async function refreshData() {
    await Promise.all([
      fetchBeaches(),
      fetchEvaluations(),
      fetchMethodologies(),
      fetchBeachTypes(),
    ]);
  }

  useEffect(() => {
    isAuthenticated && (() => {
      fetchBeaches();
      fetchEvaluations();
      fetchMethodologies();
      fetchBeachTypes();
    })();
  }, [isAuthenticated]);

  
  return (
    <DataContext.Provider
      value={{
        beaches,
        evaluations,
        methodologies,
        beachTypes,
        beachesMap,
        evaluationsMap,
        methodologiesMap,
        beachTypesMap,
        loading,
        getBeachById,
        getBeachTypeById,
        getEvaluationById,
        getMethodologyById,
        getEvaluationsByBeachId,
        getEvaluationsByMethodologyId,
        fetchBeaches,
        fetchEvaluations,
        fetchMethodologies,
        fetchBeachTypes,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}