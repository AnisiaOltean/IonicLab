import React from 'react';
import { useAppState } from "./useAppState";
import { useNetwork } from "./useNetwork";
import { IonItem } from "@ionic/react";


export const NetworkState: React.FC = () => {
    const {appState} = useAppState();
    const {networkStatus} = useNetwork();
    
    return (
        <div>
            {
                networkStatus.connected &&
                <IonItem>
                    Connected
                </IonItem>
            }
            {   !networkStatus.connected &&
                <IonItem>
                    Not Connected
                </IonItem>
            }

        </div>
    );
}