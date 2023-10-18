import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { getAllSongs, updateSongAPI, createSongAPI, newWebSocket } from './SongApi';
import { Song } from './Song';

const log = getLogger('SongProvider');

type UpdateSongFn = (song: Song) => Promise<any>;

interface SongsState {
    songs?: Song[];
    fetching: boolean;
    fetchingError?: Error | null;
    updating: boolean,
    updateError?: Error | null,
    updateSong?: UpdateSongFn,
    addSong?: UpdateSongFn,
    successMessage?: string;
    closeShowSuccess?: () => void;
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: SongsState = {
    fetching: false,
    updating: false,
};

const FETCH_SONGS_STARTED = 'FETCH_SONGS_STARTED';
const FETCH_SONGS_SUCCEEDED = 'FETCH_SONGS_SUCCEEDED';
const FETCH_SONGS_FAILED = 'FETCH_SONGS_FAILED';
const UPDATE_SONG_STARTED = 'UPDATE_SONG_STARTED';
const UPDATE_SONG_SUCCEDED = 'UPDATE_SONG_SUCCEDED';
const UPDATE_SONG_FAILED = 'UPDATE_SONG_FAILED';
const SHOW_SUCCESS_MESSSAGE = 'SHOW_SUCCESS_MESSAGE';
const HIDE_SUCCESS_MESSSAGE = 'HIDE_SUCCESS_MESSAGE';
const CREATE_SONG_STARTED = 'CREATE_SONG_STARTED';
const CREATE_SONG_SUCCEDED = 'CREATE_SONG_SUCCEDED';
const CREATE_SONG_FAILED = 'CREATE_SONG_FAILED';

const reducer: (state: SongsState, action: ActionProps) => SongsState 
    = (state, { type, payload }) => {
    switch(type){
        case FETCH_SONGS_STARTED:
            return { ...state, fetching: true, fetchingError: null };
        case FETCH_SONGS_SUCCEEDED:
            return {...state, songs: payload.songs, fetching: false };
        case FETCH_SONGS_FAILED:
            return { ...state, fetchingError: payload.error, fetching: false };
        case UPDATE_SONG_STARTED:
            return { ...state, updateError: null, updating: true };
        case UPDATE_SONG_FAILED:
            return { ...state, updateError: payload.error, updating: false };
        case UPDATE_SONG_SUCCEDED:
            const songs = [...(state.songs || [])];
            const song = payload.song;
            const index = songs.findIndex(it => it.id === song.id);
            songs[index] = song;
            return { ...state,  songs, updating: false };
        case CREATE_SONG_FAILED:
          return { ...state, updateError: payload.error, updating: false };
        case CREATE_SONG_STARTED:
          return { ...state, updateError: null, updating: true };
        case CREATE_SONG_SUCCEDED:
            const beforeSongs = [...(state.songs || [])];
            const createdSong = payload.song;
            const indexOfAdded = beforeSongs.findIndex(it => it.id === createdSong.id);
            if (indexOfAdded === -1) {
              beforeSongs.splice(0, 0, createdSong);
            } else {
              beforeSongs[indexOfAdded] = createdSong;
            }
            console.log(beforeSongs);
            console.log(payload);
            return { ...state,  songs: beforeSongs, updating: false };
        case SHOW_SUCCESS_MESSSAGE:
            const allSongs = [...(state.songs || [])];
            const updatedSong = payload.updatedSong;
            const indexOfSong = allSongs.findIndex(it => it.id === updatedSong.id);
            allSongs[indexOfSong] = updatedSong;
            console.log(payload);
            return {...state, songs: allSongs, successMessage: payload.successMessage }
        case HIDE_SUCCESS_MESSSAGE:
            return {...state, successMessage: payload }
        
        default:
            return state;
    }
};

export const SongsContext = React.createContext(initialState);

interface SongProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const SongProvider: React.FC<SongProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { songs, fetching, fetchingError, updating, updateError, successMessage } = state;

    useEffect(getItemsEffect, []);
    useEffect(wsEffect, []);

    const updateSong = useCallback<UpdateSongFn>(updateSongCallback, []);
    const addSong = useCallback<UpdateSongFn>(addSongCallback, []);

    log('returns');

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
        }

        async function fetchItems() {
            try{
                log('fetchBooks started');
                dispatch({ type: FETCH_SONGS_STARTED });
                const songs = await getAllSongs();
                log('fetchItems succeeded');
                if (!canceled) {
                dispatch({ type: FETCH_SONGS_SUCCEEDED, payload: { songs } });
                }
            } catch (error) {
                log('fetchItems failed');
                if (!canceled) {
                    dispatch({ type: FETCH_SONGS_FAILED, payload: { error } });
                }
            }
        }
    }

    async function updateSongCallback(song: Song) {
        try {
          log('updateSong started');
          dispatch({ type: UPDATE_SONG_STARTED });
          const updatedSong = await updateSongAPI(song);
          log('saveSong succeeded');
          dispatch({ type: UPDATE_SONG_SUCCEDED, payload: { song: updatedSong } });
        } catch (error) {
          log('updateSong failed');
          dispatch({ type: UPDATE_SONG_FAILED, payload: { error } });
        }
    }

    async function addSongCallback(song: Song){
        try{
          log('updateSong started');
          dispatch({ type: CREATE_SONG_STARTED });
          const addedSong = await createSongAPI(song);
          console.log(addedSong);
          log('saveSong succeeded');
          dispatch({ type: CREATE_SONG_SUCCEDED, payload: { song: addedSong } });
        }catch(error){
          log('addSong failed');
          dispatch({ type: CREATE_SONG_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        const closeWebSocket = newWebSocket(message => {
          if (canceled) {
            return;
          }
          const { event, payload } = message;
          log(`ws message, item ${event}`);
          if (event === 'updated') {
            console.log(payload);
            dispatch({ type: SHOW_SUCCESS_MESSSAGE, payload: {successMessage: payload.successMessage, updatedSong: payload.updatedSong } });
          }
          else if(event == 'created'){
            console.log(payload);
            dispatch({ type: CREATE_SONG_SUCCEDED, payload: { song: payload.updatedSong } });
          }
        });
        return () => {
          log('wsEffect - disconnecting');
          canceled = true;
          closeWebSocket();
        }
    }

    function closeShowSuccess(){
        dispatch({ type: HIDE_SUCCESS_MESSSAGE, payload: null });
    }

    const value = { songs, fetching, fetchingError, updating, updateError, updateSong, addSong, successMessage, closeShowSuccess };

    return (
        <SongsContext.Provider value={value}>
            {children}
        </SongsContext.Provider>
    );
};

