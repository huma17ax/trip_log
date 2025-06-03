export type Location = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    wish: boolean;
}

export type Event = {
    id: string;
    name: string;
    location: Location;
    date_from: string;
    date_to: string;
    url: string;
}

export type Visited = {
    id: string;
    location: Location;
    events: Event[];
    date: string;
    memo: string;
    photos: string[];
}