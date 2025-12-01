# SISCOST Mobile

Aplicativo mobile do Sistema de Avaliação de Ativos Costeiros (SISCOST) desenvolvido com React Native e Expo.

## 📱 Funcionalidades

- ✅ Autenticação (Login e Cadastro)
- ✅ Dashboard com estatísticas
- ✅ Listagem e detalhes de praias
- ✅ Visualização de metodologias
- ✅ Listagem de avaliações
- ✅ Perfil do usuário
- ✅ Navegação por abas
- ✅ Pull-to-refresh em todas as listas
- ✅ Busca de praias

## 🚀 Como executar

### Pré-requisitos

- Node.js instalado
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Backend SISCOST rodando (padrão: http://127.0.0.1:8000/)

### Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a URL da API (opcional):
Crie um arquivo `.env` na raiz do projeto:
```
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

### Executar em dispositivos

- **Android**: `npm run android` (requer Android Studio/emulador)
- **iOS**: `npm run ios` (requer macOS e Xcode)
- **Web**: `npm run web`

Ou escaneie o QR code com o app Expo Go no seu celular.

## 📁 Estrutura do Projeto

```
siscost-mobile/
├── src/
│   ├── contexts/          # Contextos React (Auth, Data)
│   ├── navigation/        # Configuração de navegação
│   ├── screens/           # Telas do aplicativo
│   │   ├── auth/         # Telas de autenticação
│   │   └── main/         # Telas principais
│   ├── services/         # Serviços (API)
│   └── types/            # Tipos TypeScript
├── App.tsx               # Componente principal
└── package.json
```

## 🔧 Tecnologias Utilizadas

- **React Native** - Framework mobile
- **Expo** - Plataforma de desenvolvimento
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação
- **AsyncStorage** - Armazenamento local
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas

## 📝 Notas

- O app usa AsyncStorage para persistir o token de autenticação
- A navegação é baseada em abas para as telas principais
- Todas as listas suportam pull-to-refresh
- O app detecta automaticamente se o usuário está autenticado

## 🐛 Troubleshooting

Se encontrar problemas:

1. Limpe o cache: `expo start -c`
2. Reinstale as dependências: `rm -rf node_modules && npm install`
3. Verifique se a URL da API está correta no `.env`

