import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage, IonTextarea,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { IssueContext } from './IssueProvider';
import { RouteComponentProps } from 'react-router';
import { IssueProps } from './IssueProps';

const log = getLogger('IssueEdit');

interface IssueEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const IssueEdit: React.FC<IssueEditProps> = ({ history, match }) => {
    const { issues, saving, savingError, saveIssue, deleting, deletingError, deleteIssue } = useContext(IssueContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [state, setState] = useState('');
    const [issue, setIssue] = useState<IssueProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const issue = issues?.find(it => it.id === routeId);
        setIssue(issue);
        if (issue) {
            setTitle(issue.title);
            setDescription(issue.description);
            setState(issue.state);
        }
    }, [match.params.id, issues]);
    const handleSave = () => {
        const editedIssue = issue ? { ...issue, title, description, state} : { title, description, state};
        saveIssue && saveIssue(editedIssue).then(() => history.goBack());
    };
    const handleDelete = () => {
        const editedIssue = issue ? { ...issue, title, description, state} : { title: '', description:'', state:''};
        deleteIssue && deleteIssue(editedIssue).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Manage</IonTitle>
                    <IonButtons slot="end">
                        {
                            (issue && issue.id) ?
                                <>
                                    <IonButton onClick={handleSave}>
                                        Save changes
                                    </IonButton>
                                    <IonButton onClick={handleDelete}>
                                        Delete
                                    </IonButton>
                                </>
                                :
                                <IonButton onClick={handleSave}>
                                    Save
                                </IonButton>
                        }
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel position="stacked">Title</IonLabel>
                    <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Description</IonLabel>
                    <IonTextarea rows={5} value={description} onIonChange={e => setDescription(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">State</IonLabel>
                    <IonInput value={state} onIonChange={e => setState(e.detail.value || '')} />
                </IonItem>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save issue'}</div>
                )}
                <IonLoading isOpen={deleting} />
                {deletingError && (
                    <div>{deletingError.message || 'Failed to delete issue'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default IssueEdit;
