import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  IonLabel, 
  IonFab,
  IonFabButton,
  IonIcon,
  IonActionSheet,
  createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { SongsContext } from './SongProvider';
import { Song } from './Song';
import styles from './styles.module.css';
import { MyPhoto, usePhotos } from '../photo/usePhotos';
import { camera, close, trash } from 'ionicons/icons';
import MyMap from '../maps/MyMap';
import { useLocation } from 'react-router';
import { useMyLocation } from '../maps/useMyLocation';

const log = getLogger('EditLogger');

interface SongEditProps extends RouteComponentProps<{
  id?: string;
}> {}


export const SongEdit: React.FC<SongEditProps> = ({ history, match }) => {
  const { songs, updating, updateError, updateSong, deleteSong } = useContext(SongsContext);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [songToUpdate, setSongToUpdate] = useState<Song>();

  const [webViewPath, setWebViewPath] = useState<string | undefined>('');
  const { photos, takePhoto, deletePhoto } = usePhotos();
  const [photoToDelete, setPhotoToDelete] = useState<MyPhoto>();
  
  //const {latitude: lat = 46, longitude: lng = 23} = location.position?.coords || {};
  const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
  const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);

  console.log('render', webViewPath, currentLatitude, currentLongitude);
  const filteredPhoto = photos.find(p => p.webviewPath === webViewPath);
  console.log('filtered photo: ', filteredPhoto);

  useEffect(simpleAnimation, []);

  useEffect(() => {
    console.log('k', webViewPath);
    const routeId = match.params.id || '';
    console.log(routeId);
    //const idNumber = parseInt(routeId);
    const song = songs?.find(it => it._id === routeId);
    setSongToUpdate(song);
    console.log('song: ', song);
    if(song){
      setTitle(song.title);
      setDuration(song.duration.toString());
      setWebViewPath(song.webViewPath || '');
      console.log('la:', song.latitude);
      setCurrentLatitude(song.latitude ? song.latitude : 46);
      setCurrentLongitude(song.longitude ? song.longitude : 23);
    }
  }, [match.params.id, songs]);


  const handleUpdate = useCallback(() => {
    console.log('path: ', webViewPath);
    const editedSong ={ ...songToUpdate, title: title, duration: parseFloat(duration), webViewPath: webViewPath !=='' ? webViewPath: undefined, latitude: currentLatitude, longitude: currentLongitude };
    //console.log(duration);
    //console.log(editedSong);
    log('edited song: ', editedSong);
    console.log(updateSong);
    updateSong && updateSong(editedSong).then(() => editedSong.duration && history.goBack());
  }, [songToUpdate, updateSong, title, duration, history, webViewPath, currentLatitude, currentLongitude]);

  const handleDelete = useCallback(()=>{
    console.log(songToUpdate?._id);
    deleteSong && deleteSong(songToUpdate?._id!).then(()=> history.goBack());
  }, [songToUpdate, deleteSong, title, duration, history]);

  async function handlePhotoChange() {
    console.log('handle photo change...');
    const imagePath = await takePhoto();
    console.log(imagePath);

    if(imagePath){
      setWebViewPath(imagePath);
      console.log('here', imagePath);
    }
    console.log(webViewPath);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleUpdate}>
              Update
            </IonButton>
            {/* <IonButton onClick={handleDelete}>
              Delete
            </IonButton> */}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput label="Title:" className={styles.customInput} placeholder="New Title" value={title} onIonInput={e => setTitle(prev => e.detail.value || '')} />
        <IonInput label="Duration:" className={styles.customInput} placeholder="New duration" value={duration} onIonInput={e => e.detail.value ? setDuration(prev => e.detail.value!) : setDuration('') }/>
        <IonLoading isOpen={updating} />
        {updateError && (
          <div className={styles.errorMessage}>{updateError.message || 'Failed to update item'}</div>
        )}
        {webViewPath && (<img onClick={()=> setPhotoToDelete(filteredPhoto)} src={webViewPath} width={'200px'} height={'200px'}/>)}
        {!webViewPath && (
          <IonFab vertical="bottom" horizontal="center" slot="fixed">
              <IonFabButton className="square-a" onClick={handlePhotoChange}>
                  <IonIcon icon={camera}/>
              </IonFabButton>
          </IonFab>)
        }
          <IonActionSheet
            isOpen={!!photoToDelete}
            buttons={[{
              text: 'Delete',
              role: 'destructive',
              icon: trash,
              handler: () => {
                if (photoToDelete) {
                  deletePhoto(photoToDelete);
                  setPhotoToDelete(undefined);
                  setWebViewPath(undefined);
                }
              }
            }, {
              text: 'Cancel',
              icon: close,
              role: 'cancel'
            }]}
            onDidDismiss={() => setPhotoToDelete(undefined)} />
            <MyMap
                lat={currentLatitude}
                lng={currentLongitude}
                onCoordsChanged={(newLat, newLng)=>{
                  log(`HAHA ${newLat} ${newLng}`)
                  setCurrentLatitude(newLat);
                  setCurrentLongitude(newLng);
                }}                      
            />    
      </IonContent>
    </IonPage>
  );

  function simpleAnimation() {
    const el = document.querySelector('.square-a');
    if (el) {
        const animation = createAnimation()
            .addElement(el)
            .duration(2000)
            .direction('alternate')
            .iterations(Infinity)
            .keyframes([
                { offset: 0, transform: 'scale(1.1)', opacity: '0.5', color: 'white'},
                { offset: 0.5, transform: 'scale(1.3)', opacity: '1', color: 'white'},
                { offset: 1, transform: 'scale(1)', opacity: '0.5', color: 'white'}
            ]);
        animation.play();
    }
  }
}
