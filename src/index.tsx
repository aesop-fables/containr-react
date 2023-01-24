import React, { createContext, useContext } from 'react';
import { IServiceContainer, ServiceContainerStack } from '@aesop-fables/containr';
import useConstant, { useDisposableConstant } from './hooks/useConstant';

export * from './hooks';

export const ServiceContext = createContext<null | ServiceContainerStack>(null);
const ServiceContextProvider = ServiceContext.Provider;

interface ServiceProviderPops {
  children: JSX.Element;
  rootContainer: IServiceContainer;
}

export const ServiceProvider: React.FC<ServiceProviderPops> = ({ children, rootContainer }) => {
  const stack = new ServiceContainerStack(rootContainer);
  return <ServiceContextProvider value={stack}>{children}</ServiceContextProvider>;
};

export function useServiceStack(): ServiceContainerStack {
  const stack = useContext(ServiceContext);

  if (stack === null) {
    throw new Error('Container stack cannot be null, please add a context provider');
  }

  return stack;
}

export function useServiceContainer(): IServiceContainer {
  const stack = useContext(ServiceContext);

  if (stack === null) {
    throw new Error('Container stack cannot be null, please add a context provider');
  }

  return stack.current();
}

export function useService<T>(key: string): T {
  const container = useServiceContainer();
  return useConstant(() => container.get<T>(key));
}

export function useScopedServiceContainer(provenance: string): IServiceContainer {
  const stack = useServiceStack();
  const current = stack.current();
  const scopedContainer = useDisposableConstant(
    () => {
      const scope = current.createChildContainer(provenance);
      stack.push(scope);
      return scope;
    },
    () => {
      stack.pop();
    },
  );

  return scopedContainer;
}
