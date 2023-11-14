export interface Song {
    _id?: string;
    artist?: string;
    duration: number;
    title: string;
    dateOfRelease?: Date;
    hasFeaturedArtists?: boolean;
    isNotSaved?: boolean;
    webViewPath?: string;
    latitude?: number;
    longitude?: number;
}