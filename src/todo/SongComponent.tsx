import React, { memo } from "react";
import { IonItem, IonLabel } from "@ionic/react";
import { getLogger } from "../core";
import { Song } from "./Song";
import styles from "./styles.module.css";

interface SongPropsExtended extends Song {
    onEdit: (_id?: string) => void;
}

const SongComponent: React.FC<SongPropsExtended> = ({_id, artist, duration, title, dateOfRelease, hasFeaturedArtists, onEdit }) => (
    <IonItem onClick={()=> onEdit(_id)}>
        <div className={styles.songContainer}>
            <IonLabel className={styles.songTitle}>
                <h1>{title}</h1>
            </IonLabel>
            <div className={styles.component}>
                <p>Artist: {artist} </p>
                <p>Duration: {duration}  min</p>
                {dateOfRelease && (
                    <p>Released at: {new Date(dateOfRelease).toDateString()} </p>
                )}
                {hasFeaturedArtists && <p>Featured: Yes</p>}
            </div>
        </div>
    </IonItem>
);

export default memo(SongComponent);
