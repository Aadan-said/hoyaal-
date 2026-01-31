export type PropertyType = 'Rent' | 'Sale';
export type VerificationStatus = 'verified' | 'agent' | 'unverified';

export interface Location {
    city: string;
    district: string;
}

export interface Owner {
    id: string;
    name: string;
    phone: string;
    rating: number;
    avatar?: string;
}


export interface Property {
    id: string;
    title: string;
    price: number;
    currency: string;
    type: PropertyType;
    location: Location;
    bedrooms: number;
    bathrooms: number;
    area: string | number;
    image: string;
    verification: VerificationStatus;
    owner: Owner;
    rating?: number;
    description?: string;
    latitude?: number;
    longitude?: number;
}

