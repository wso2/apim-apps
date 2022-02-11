import React, { useContext } from 'react';

const ApiOperationContext = React.createContext({ });
export const useApiOperationContext = () => useContext(ApiOperationContext);
export const ApiOperationContextProvider = ApiOperationContext.Provider;
export default ApiOperationContext;