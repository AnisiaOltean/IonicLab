import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import SongComponent from './SongComponent';
import { getLogger } from '../core';
import { SongsContext } from './SongProvider';
import { IonContent, 
         IonHeader, 
         IonList, 
         IonLoading, 
         IonPage, 
         IonTitle, 
         IonToolbar,
         IonToast, 
         IonFab,
         IonFabButton,
         IonIcon } from '@ionic/react';

import { add } from 'ionicons/icons';

const log = getLogger('SongsList');

export const SongsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { songs, fetching, fetchingError, successMessage, closeShowSuccess } = useContext(SongsContext);

  log('render');
  console.log(songs);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Songs App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching songs..." />
        {songs && (
          <IonList>
            {songs.map(song => 
              <SongComponent key={song.id} id={song.id} 
              artist={song.artist}
              title={song.title} 
              duration={song.duration} 
              dateOfRelease={song.dateOfRelease}
              hasFeaturedArtists={song.hasFeaturedArtists} 
              onEdit={id => history.push(`/song/${id}`)} /> 
            )}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch songs'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/song')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        <IonToast
          isOpen={!!successMessage}
          message={successMessage}
          position='bottom'
          buttons={[
            {
              text: 'Dismiss',
              role: 'cancel',
              handler: () => {
                console.log('More Info clicked');
              },
            }]}
          onDidDismiss={closeShowSuccess}
          duration={5000}
          />
      </IonContent>
    </IonPage>
  );
};