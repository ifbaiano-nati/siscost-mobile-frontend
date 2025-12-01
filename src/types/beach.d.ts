export interface IBeachType {
  id: number;
  des_description: string;
  des_name: string;
  vl_value: number;
  updated_at: string;
  created_at: string;
}

export interface IEstado {
  id: number;
  name: string;
  uf: string;
  codigo_ibge: number | null;
}

export interface IMunicipio {
  id: number;
  id_estado: number;
  des_name: string;
  des_code_ibge: string | null;
  estado: IEstado;
  updated_at: string;
  created_at: string;
}

export interface IBeach {
  id: number;
  des_name: string;
  des_description: string;
  descricao_socioambiental: string | null;
  nota_qualidade_atual: number | null;
  status_monitoramento: string;
  foto_principal_path: string | null;
  id_beach_type: number;
  municipio_id: number;
  cadastrado_por_user_id: number;
  beach_type: IBeachType;
  municipio: IMunicipio;
  cadastrador: {
    id: number;
    name: string;
    email: string;
  };
  updated_at: string;
  created_at: string;
}

export interface IMethodology {
  id: number;
  des_name: string;
  des_description: string;
}

export interface IIndicator {
  id: number;
  name: string;
  description: string | null;
  value: number | null;
}

export interface ICategory {
  id: number;
  name: string;
  description: string;
  indicators: IIndicator[];
}

export interface IDimension {
  id: number;
  name: string;
  description: string | null;
  categories: ICategory[];
}

export interface IBeachEvaluation {
  id: number;
  id_beach: number;
  id_metodologie: number;
  vl_value: number;
  created_at: string;
  updated_at: string;
  json_data: any;
  id_user: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

