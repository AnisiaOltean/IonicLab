export interface Song {
    id?: number;
    artist?: string;
    duration: number;
    title: string;
    dateOfRelease?: Date;
    hasFeaturedArtists?: boolean;
}