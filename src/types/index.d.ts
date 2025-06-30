export type Location = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    google_place_id: string;
    google_place_photo: string;
    google_place_website: string;
    wish: boolean;
}

export type Event = {
    id: string;
    name: string;
    location_id: string;
    date_from: string;
    date_to: string;
    url: string;
}

export type Visited = {
    id: string;
    location_id: string;
    event_ids: string[];
    date: string;
    memo: string;
    photos: string[];
}