import React, { useEffect } from 'react';
import { createContainer, createServiceModule } from '@aesop-fables/containr';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ServiceProvider, useScopedServiceContainer, useService } from '..';

interface ISampleService {
  instanceId: string;
  invoke(): void;
}

let nrInstantiations = 0;

class SampleService implements ISampleService {
  constructor(private id: string) {
    ++nrInstantiations;
  }

  get instanceId(): string {
    return this.id;
  }

  public invoke(): void {
    console.log('Invoked!');
  }
}

const SampleServiceKey = 'test:sample';

const SampleComponent: React.FC = () => {
  const service = useService<ISampleService>(SampleServiceKey);
  useEffect(() => {
    service.invoke();
  }, []);
  return <p>All done</p>;
};

interface ScopedProps {
  children: JSX.Element;
}

const ScopedComponent: React.FC<ScopedProps> = ({ children }) => {
  useScopedServiceContainer('ScopedComponent');
  return <>{children}</>;
};

const useSampleService = createServiceModule(SampleServiceKey, (services) => {
  services.register<ISampleService>(SampleServiceKey, () => new SampleService('Hello, World!'));
});

describe('useService', () => {
  beforeEach(() => {
    nrInstantiations = 0;
  });

  test('Resolves the service', () => {
    const container = createContainer([useSampleService]);
    render(
      <ServiceProvider rootContainer={container}>
        <SampleComponent />
      </ServiceProvider>,
    );

    expect(nrInstantiations).toBe(1);
  });

  test('Resolves service from a scoped container', () => {
    const container = createContainer([useSampleService]);
    render(
      <ServiceProvider rootContainer={container}>
        <ScopedComponent>
          <SampleComponent />
        </ScopedComponent>
      </ServiceProvider>,
    );

    
    expect(nrInstantiations).toBe(1);
    
    const service = container.get<ISampleService>(SampleServiceKey);
    service.invoke();

    expect(nrInstantiations).toBe(2);
  });
});
