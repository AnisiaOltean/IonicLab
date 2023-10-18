import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonLabel
} from '@ionic/react';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { SongsContext } from './SongProvider';
import { Song } from './Song';
import styles from './styles.module.css';

const log = getLogger('SaveLogger');

interface SongEditProps extends RouteComponentProps<{
  id?: string;
}> {}

export const SongAdd: React.FC<SongEditProps> = ({ history, match }) => {
  const { songs, updating, updateError, addSong } = useContext(SongsContext);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [artist, setArtist] = useState('');
  const [songToUpdate, setSongToUpdate] = useState<Song>();

  useEffect(() => {
    const routeId = match.params.id || '';
    console.log(routeId);
    const idNumber = parseInt(routeId);
    const song = songs?.find(it => it.id === idNumber);
    setSongToUpdate(song);
    if(song){
      setTitle(song.title);
      setArtist(song.artist!);
      setDuration(song.duration.toString());
    }
  }, [match.params.id, songs]);

  const handleAdd = useCallback(() => {
    const editedSong ={ ...songToUpdate, title: title, artist: artist, duration: parseFloat(duration) };
    //console.log(duration);
    //console.log(editedSong);
    log(editedSong);
    addSong && addSong(editedSong).then(() => history.goBack());
  }, [songToUpdate, addSong, title, duration, artist, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleAdd}>
              Add
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput label="Title:" className={styles.customInput} placeholder="New Title" value={title} onIonInput={e => setTitle(prev => e.detail.value || '')} />
        <IonInput label="Artist:" className={styles.customInput} placeholder="New Artist" value={artist} onIonInput={e => setArtist(prev => e.detail.value || '')} />
        <IonInput label="Duration:" className={styles.customInput} placeholder="New duration" value={duration} onIonInput={e => e.detail.value ? setDuration(prev => e.detail.value!) : setDuration('') }/>
        <IonLoading isOpen={updating} />
        {updateError && (
          <div>{updateError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
}
