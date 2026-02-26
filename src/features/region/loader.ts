import type { LoaderFunctionArgs } from 'react-router-dom';
import { provinces } from '@/data/provinces';
import { regencies } from '@/data/regencies';
import { districts } from '@/data/districts';
import type { LoaderData } from './types';

export async function regionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
    const url = new URL(request.url);
    const provinceId = Number(url.searchParams.get('province')) || null;
    const regencyId = Number(url.searchParams.get('regency')) || null;
    const districtId = Number(url.searchParams.get('district')) || null;

    return {
        provinces,
        regencies,   // full list — sidebar filters client-side
        districts,   // full list — sidebar filters client-side
        selected: { provinceId, regencyId, districtId },
    };
}
