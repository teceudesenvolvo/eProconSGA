import React, { createContext, useContext, useState } from 'react';

// 1. Cria o Contexto
const LoadingContext = createContext(undefined);

// 2. Cria o Provedor do Contexto
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // O valor do contexto que será fornecido aos componentes filhos
  const contextValue = {
    isLoading,
    setIsLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// 3. Cria um Hook Personalizado para Consumir o Contexto
export const useLoading = () => {
  const context = useContext(LoadingContext);

  // Verifica se o hook está a ser usado dentro do provedor
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }

  return context;
};
