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
         IonFooter } from '@ionic/react';

const log = getLogger('BooksList');

export const SongsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { songs, fetching, fetchingError, successMessage, closeShowSuccess} = useContext(SongsContext);

  log('render');
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