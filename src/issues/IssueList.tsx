import React, {useContext, useEffect, useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router';
import {
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList, IonLoading,
    IonPage, IonSearchbar,
    IonTitle,
    IonToolbar, useIonViewWillEnter
} from '@ionic/react';
import {add } from 'ionicons/icons';
import Issue from './Issue';
import { getLogger, Storage } from '../core';
import { IssueContext } from './IssueProvider';

const log = getLogger('IssueList');

const IssueList: React.FC<RouteComponentProps> = ({ history }) => {
    const { issues, fetching, fetchingError } = useContext(IssueContext);
    const [filterIssues, setFilterIssues] = useState<string>('');

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
            <IonContent fullscreen>
                <IonSearchbar
                    value={filterIssues}
                    debounce={100}
                    onIonChange={e => setFilterIssues(e.detail.value!)}>
                </IonSearchbar>
                <IonLoading isOpen={fetching} message="Fetching issues" />
                {issues && (
                    <IonList>
                        {issues.filter(({ _id, title, description,state}) => title.toLowerCase().includes(filterIssues.toLowerCase())).map(({ _id, title, description,state}) =>
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
