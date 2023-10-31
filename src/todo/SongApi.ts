import axios from "axios";
import { getLogger, authConfig, baseUrl, withLogs } from "../core";
import { Song } from "./Song";
import { Preferences } from "@capacitor/preferences";

const log = getLogger('songLogger');

const getBooksUrl = `http://${baseUrl}/api/song`;
const updateBookUrl = `http://${baseUrl}/api/song`;
const createSongUrl = `http://${baseUrl}/api/song`;

export const getAllSongs: (token: string) => Promise<Song[]> = (token) => {
    return withLogs(axios.get(getBooksUrl, authConfig(token)), 'getAllSongs');
}

export const updateSongAPI: (token: string, song: Song) => Promise<Song[]> = (token, song) => {
    return withLogs(axios.put(`${updateBookUrl}/${song._id}`, song, authConfig(token)), 'updateSong');
}

export const createSongAPI: (token: string, song: Song, networkStatus: any, present: any) => Promise<Song[]> = (token, song, networkStatus, present ) => {
  function offlineActionGenerator() {
    return new Promise<Song>(async (resolve) => {
        present("Couldn't send data to the server, caching it locally", 3000);
        await Preferences.set({
            key: `sav-${song.title}`,
            value: JSON.stringify({token, song })
        })
        resolve(song);
    });
}
    if(networkStatus.connected){
        return withLogs(axios.post(`${createSongUrl}`, song, authConfig(token)), 'createSong').catch( () => {
            return offlineActionGenerator();
        });
    }
    return offlineActionGenerator();
  //return withLogs(axios.post(`${createSongUrl}`, song, authConfig(token)), 'createSong');
}

export const deleteSongAPI: (token: string, id: string) => Promise<Song[]> = (token, id) => {
  return withLogs(axios.delete(`${createSongUrl}/${id}`, authConfig(token)), 'deleteSong');
}

interface MessageData {
    event: string;
    payload: {
      successMessage: string,
      updatedSong: Song
    };
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({type: 'authorization', payload :{token}}));
    };
    ws.onclose = () => {
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      console.log(messageEvent.data);
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
}

  