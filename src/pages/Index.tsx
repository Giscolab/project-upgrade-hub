import { Suspense, lazy } from 'react';

const ShaderStudioPage = lazy(() => import('@/features/shader-studio/ShaderStudioPage'));

const Index = () => {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-background" />}>
      <ShaderStudioPage />
    </Suspense>
  );
};

export default Index;
