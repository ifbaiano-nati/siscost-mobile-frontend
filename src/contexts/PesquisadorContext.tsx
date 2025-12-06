// /src/contexts/PesquisadorDataContext.tsx

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { IDashboardMetrics } from '../types/metrics';
// --- INTERFACES COMPLETAS BASEADAS NO BACKEND (Seção 3.1) ---

interface PesquisadorContextData {
    // Agora o TypeScript sabe que este IDashboardMetrics é o importado
    metrics: IDashboardMetrics | null;
    loading: boolean;
    refreshMetrics: () => Promise<void>;
}

const PesquisadorContext = createContext<PesquisadorContextData>({} as PesquisadorContextData);

export function PesquisadorDataProvider({ children }: { children: ReactNode }) {
    const[metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(false);

    // A função que chama o novo endpoint /pesquisador/metricas_dashboard
    const refreshMetrics = useCallback(async () => {
        setLoading(true);
        try {
            // Chama a função da API (que você implementou em api.ts)
            const data = await api.getPesquisadorMetrics();
            setMetrics(data);
        } catch (error) {
            console.error("Erro ao buscar métricas do Pesquisador:", error);
            setMetrics(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ ATIVANDO: Carrega as métricas na inicialização do Provider
    useEffect(() => {
        // Carrega se não houver métricas ou se for necessário recarregar
        if (!metrics) {
            refreshMetrics();
        }
    }, [refreshMetrics]);


    return (
        <PesquisadorContext.Provider
            value={{ metrics, loading, refreshMetrics }}
        >
            {children}
        </PesquisadorContext.Provider>
    );
}

// ✅ ESTE HOOK É EXPORTADO CORRETAMENTE E DEVE SER USADO NO DashboardScreen.tsx
export function usePesquisadorData() {
    const context = useContext(PesquisadorContext);

    if (!context) {
        throw new Error('usePesquisadorData must be used within a PesquisadorDataProvider');
    }

    return context;
}