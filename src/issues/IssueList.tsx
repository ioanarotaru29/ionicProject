import React, { useContext } from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Issue from './Issue';
import { getLogger, Storage } from '../core';
import { IssueContext } from './IssueProvider';
import {Link} from "react-router-dom";
import {render} from "react-dom";

const log = getLogger('IssueList');

const IssueList: React.FC<RouteComponentProps> = ({ history }) => {
    const { issues, fetching, fetchingError } = useContext(IssueContext);
    log('render');
    const handleLogout = () => {
        Storage.clear();
        window.location.reload();
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Issues List</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleLogout}>Logout</IonButton>
                    </IonButtons>

                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching issues" />
                {issues && (
                    <IonList>
                        {issues.map(({ _id, title, description,state}) =>
                            <Issue key={_id} _id={_id} title={title} description={description} state={state} onEdit={id => history.push(`/issue/${id}`)} />)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch issues'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/issue')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default IssueList;