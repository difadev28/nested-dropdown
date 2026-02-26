import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { regionLoader } from '@/features/region/loader';
import { RegionPage } from '@/features/region';

export const router = createBrowserRouter([
    {
        id: 'root',
        path: '/',
        element: <AppLayout />,
        loader: regionLoader,
        children: [
            {
                index: true,
                element: <RegionPage />,
            },
        ],
    },
]);
