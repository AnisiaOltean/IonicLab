import axios from "axios";
import { getLogger } from "../core";
import { Song } from "./Song";

const log = getLogger('songLogger');

interface ResponseProps<T> {
    data: T;
  }

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
log(`${fnName} - started`);
return promise
    .then(res => {
    log(`${fnName} - succeeded`);
    return Promise.resolve(res.data);
    })
    .catch(err => {
    log(`${fnName} - failed`);
    return Promise.reject(err);
    });
}
  
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

const baseURL = "localhost:3000";
const getBooksUrl = `http://${baseURL}/songs`;
const updateBookUrl = `http://${baseURL}/song`;

export const getAllSongs: () => Promise<Song[]> = () => {
    return withLogs(axios.get(getBooksUrl, config), 'getAllSongs');
}

export const updateSongAPI: (song: Song) => Promise<Song[]> = (song) => {
    return withLogs(axios.put(`${updateBookUrl}/${song.id}`, song, config), 'updateSong');
}

interface MessageData {
    event: string;
    payload: string;
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseURL}`)
    ws.onopen = () => {
      log('web socket onopen');
    };
    ws.onclose = () => {
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
}

  