import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
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
import { getLogger } from '../core';
import { IssueContext } from './IssueProvider';

const log = getLogger('IssueList');

const IssueList: React.FC<RouteComponentProps> = ({ history }) => {
    const { issues, fetching, fetchingError } = useContext(IssueContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>My App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching issues" />
                {issues && (
                    <IonList>
                        {issues.map(({ id, title, description,state}) =>
                            <Issue key={id} id={id} title={title} description={description} state={state} onEdit={id => history.push(`/issue/${id}`)} />)}
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
