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
  IonToast
} from '@ionic/react';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { SongsContext } from './SongProvider';
import { Song } from './Song';

interface SongEditProps extends RouteComponentProps<{
  id?: string;
}> {}

export const SongEdit: React.FC<SongEditProps> = ({ history, match }) => {
  const { songs, updating, updateError, updateSong } = useContext(SongsContext);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(0);
  const [songToUpdate, setSongToUpdate] = useState<Song>();

  useEffect(() => {
    const routeId = match.params.id || '';
    console.log(routeId);
    const idNumber = parseInt(routeId);
    const song = songs?.find(it => it.id === idNumber);
    setSongToUpdate(song);
    if(song){
      setTitle(song.title);
      setDuration(song.duration);
    }
  }, [match.params.id, songs]);

  const handleUpdate = useCallback(() => {
    const editedSong ={ ...songToUpdate, title: title, duration: duration };
    console.log(duration);
    //console.log(editedSong);
    updateSong && updateSong(editedSong).then(() => history.goBack());
  }, [songToUpdate, updateSong, title, duration, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleUpdate}>
              Update
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={title} onIonChange={e => setTitle(prev => e.detail.value || '')} />
        <IonInput value={duration} onIonChange={e => e.detail.value ? setDuration(prev => parseFloat(e.detail.value!)) : setDuration(0) }/>
        <IonLoading isOpen={updating} />
        {updateError && (
          <div>{updateError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
}
