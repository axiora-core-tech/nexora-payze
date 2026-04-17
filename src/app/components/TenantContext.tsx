import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router';
import { tenantService, Tenant } from '../../services';
import { PageLoader, ErrorState } from '../components/Loaders';

const TenantContext = createContext<Tenant | null>(null);

export function useTenant() {
  return useContext(TenantContext);
}

/**
 * Wraps any route under /t/:slug. Loads the tenant from the slug, provides
 * tenant context to children via useTenant(). Redirects to / if slug is invalid.
 */
export function TenantWorkspace({ children }: { children: ReactNode }) {
  const { slug } = useParams<{ slug: string }>();
  const [tenant, setTenant] = useState<Tenant | null | undefined>(undefined); // undefined = loading
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;
    setTenant(undefined);
    tenantService.getBySlug(slug)
      .then(t => setTenant(t))
      .catch(e => setError(e));
  }, [slug]);

  if (!slug) return <Navigate to="/" replace />;
  if (error) return <ErrorState message="Couldn't load workspace" />;
  if (tenant === undefined) return <PageLoader label={`Loading ${slug}'s workspace`} />;
  if (tenant === null) return <Navigate to="/" replace />;

  return <TenantContext.Provider value={tenant}>{children}</TenantContext.Provider>;
}
