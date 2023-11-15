import React, { useContext, useEffect, useState, useRef } from 'react';
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
         IonIcon,
         IonButton, 
         IonButtons,
         IonInfiniteScroll,
         IonInfiniteScrollContent,
         IonSearchbar,
         IonSelect, IonSelectOption, createAnimation,
         IonModal } from '@ionic/react';

import { add } from 'ionicons/icons';
import { AuthContext } from '../auth';
import { NetworkState } from '../pages/NetworkState';
import { Song } from './Song';
import styles from "./styles.module.css";

const log = getLogger('SongsList');
const songsPerPage = 4;
const filterValues = ["HasFeatured", "NoFeatured"];

export const SongsList: React.FC<RouteComponentProps> = ({ history }) => {
  const { songs, fetching, fetchingError, successMessage, closeShowSuccess } = useContext(SongsContext);
  const { logout } = useContext(AuthContext);
  const [isOpen, setIsOpen]= useState(false);
  const [index, setIndex] = useState<number>(songsPerPage);
  const [songsAux, setSongsAux] = useState<Song[] | undefined>([]);
  const [more, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(()=>{
    if(fetching) setIsOpen(true);
    else setIsOpen(false);
  }, [fetching]);

  log('render');
  console.log(songs);
  console.log(songsAux);
  console.log(index);

  function handleLogout(){
    logout?.();
    history.push('/login');
  }

  //pagination
  useEffect(()=>{
    console.log('Render list, index: ', index);
    if(songs){
      setSongsAux(songs.slice(0, index));
    }
  }, [songs]);

  // searching
  useEffect(()=>{
    console.log('search changed!');
    if (searchText === "") {
      setSongsAux(songs);
    }
    if (songs && searchText !== "") {
      setSongsAux(songs.filter(song => song.artist!.startsWith(searchText)));
    }
  }, [searchText]);

   // filtering
   useEffect(() => {
    console.log('filter changed!');
    if (songs && filter) {
        setSongsAux(songs.filter(song => {
            if (filter === "HasFeatured")
                return song.hasFeaturedArtists === true;
            else
                return song.hasFeaturedArtists === false;
        }));
    }
  }, [filter]);

  function fetchData() {
    if(songs){
      const newIndex = Math.min(index + songsPerPage, songs.length);
      if( newIndex >= songs.length){
          setHasMore(false);
      }
      else{
          setHasMore(true);
      }
      console.log(newIndex);
      setSongsAux(songs.slice(0, newIndex));
      setIndex(newIndex);
      console.log('New index: ', newIndex);
    }
  }

  async function searchNext($event: CustomEvent<void>){
    await fetchData();
    await ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  const modalEl = useRef<HTMLIonModalElement>(null);
  const closeModal = () => {
    modalEl.current?.dismiss();
  };


  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot!;

    const backdropAnimation = createAnimation()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(root.querySelector('.modal-wrapper')!)
      .duration(1200)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 0.4, opacity: '0.7', transform: 'scale(1.3)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  const leaveAnimation = (baseEl: HTMLElement) => {
    return enterAnimation(baseEl).direction('reverse');
  };  

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Songs App</IonTitle>
          <IonSelect 
            className={styles.selectBar} 
            slot="end" 
            value={filter} 
            placeholder="Filter" 
            onIonChange={(e) => setFilter(e.detail.value)}>
                        {filterValues.map((each) => (
                            <IonSelectOption key={each} value={each}>
                                {each}
                            </IonSelectOption>
                        ))}
          </IonSelect>
          <NetworkState />
          <IonSearchbar className={styles.customSearchBar} placeholder="Search by artist" value={searchText} debounce={200} onIonInput={(e) => {
                        setSearchText(e.detail.value!);
                    }} slot="secondary">
          </IonSearchbar>
          <IonButtons slot='end'>
             <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading isOpen={isOpen} message="Fetching songs..." />
        {songsAux && (
          <IonList>
            {songsAux.slice(0, index).map(song => 
              <SongComponent key={song._id} _id={song._id} 
              artist={song.artist}
              title={song.title} 
              duration={song.duration} 
              dateOfRelease={song.dateOfRelease}
              hasFeaturedArtists={song.hasFeaturedArtists} 
              isNotSaved={song.isNotSaved}
              webViewPath={song.webViewPath}
              onEdit={id => history.push(`/song/${id}`)} /> 
            )}
          </IonList>
        )}
        <IonInfiniteScroll threshold="10px" disabled={!more} onIonInfinite={(e:CustomEvent<void>) => searchNext(e)} >
          <IonInfiniteScrollContent loadingText="Loading more songs..." >
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
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
          <IonButton id="modal-trigger">Present Modal</IonButton>
          <IonModal trigger="modal-trigger" ref={modalEl} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Modal</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeModal}>Close</IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">Modal Content</IonContent>
          </IonModal>
      </IonContent>
    </IonPage>
  );
};