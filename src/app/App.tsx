import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.05)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          },
        }}
      />
    </>
  );
}
