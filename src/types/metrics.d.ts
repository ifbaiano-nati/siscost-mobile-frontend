// /src/types/metrics.d.ts

// 1. Detalhe de cada item do Feed
export interface IEvaluationResumo {
  id_avaliacao: number;
  data_avaliacao: string;
  nome_praia: string;
  nota: number;
  avaliador_nome: string;
  tipo_perfil: 'TURISTA' | 'PESQUISADOR' | 'SOCIEDADE_CIVIL'; 
}

// 2. Estrutura completa da resposta do backend (o que o getPesquisadorMetrics retorna)
export interface IDashboardMetrics {
  total_praias: number;
  total_avaliacoes: number;
  total_metodologias: number;
  // Aqui, o array usa a interface detalhada acima
  avaliacoes_recentes: IEvaluationResumo[];
}