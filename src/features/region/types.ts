export interface Province {
    id: number;
    name: string;
}

export interface Regency {
    id: number;
    name: string;
    province_id: number;
}

export interface District {
    id: number;
    name: string;
    regency_id: number;
}

export interface SelectedRegion {
    provinceId: number | null;
    regencyId: number | null;
    districtId: number | null;
}

export interface LoaderData {
    provinces: Province[];
    regencies: Regency[];
    districts: District[];
    selected: SelectedRegion;
}

export interface Option {
    id: number;
    name: string;
}
