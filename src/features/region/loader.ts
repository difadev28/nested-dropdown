import type { LoaderFunctionArgs } from 'react-router-dom';
import type { LoaderData, Province, Regency, District } from './types';

export async function regionLoader({ request }: LoaderFunctionArgs): Promise<LoaderData> {
    const url = new URL(request.url);
    const provinceId = Number(url.searchParams.get('province')) || null;
    const regencyId = Number(url.searchParams.get('regency')) || null;
    const districtId = Number(url.searchParams.get('district')) || null;

    const [provincesRes, regenciesRes, districtsRes] = await Promise.all([
        fetch('/data/provinces.json'),
        fetch('/data/regencies.json'),
        fetch('/data/districts.json'),
    ]);

    const provinces: Province[] = await provincesRes.json();
    const regencies: Regency[] = await regenciesRes.json();
    const districts: District[] = await districtsRes.json();

    return {
        provinces,
        regencies,
        districts,
        selected: { provinceId, regencyId, districtId },
    };
}
