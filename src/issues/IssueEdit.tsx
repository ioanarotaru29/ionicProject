import React, {EffectCallback, useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage, IonTextarea,
    IonTitle,
    IonToolbar,
    createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { IssueContext } from './IssueProvider';
import { RouteComponentProps } from 'react-router';
import { IssueProps } from './IssueProps';
import {useNetwork} from "../core/useNetwork";

const log = getLogger('IssueEdit');

interface IssueEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const IssueEdit: React.FC<IssueEditProps> = ({ history, match }) => {
    const { issues, saving, savingError, saveIssue, deleting, deletingError, deleteIssue, usingLocal } = useContext(IssueContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [state, setState] = useState('');
    const [issue, setIssue] = useState<IssueProps>();

    const [goBack, setGoBack] = useState(false);

    const { networkStatus }  = useNetwork();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const issue = issues?.find(it => it._id === routeId);
        setIssue(issue);
        if (issue) {
            setTitle(issue.title);
            setDescription(issue.description);
            setState(issue.state);
        }
    }, [match.params.id, issues]);

    useEffect(() => {
        log('useEffect using local');
        if(goBack && usingLocal)
            alert("Using local storage");
    }, [ goBack, usingLocal ])

    useEffect(() => {
        log('useEffect errors');
        if(goBack && savingError == null && deletingError == null)
            history.goBack();
    }, [ goBack, savingError, deletingError])

    const handleSave = () => {
        setGoBack(false);
        if(title === ""){
            const title_label = document.querySelector(".title_label")
            if(title_label){
                const animation = createAnimation()
                    .addElement(title_label)
                    .duration(2000)
                    .keyframes([
                        {offset: 0.1, transform: 'translateX(-1px)', color: 'red'},
                        {offset: 0.2, transform: 'translateX(2px)', color: 'red'},
                        {offset: 0.3, transform: 'translateX(-4px)', color: 'red'},
                        {offset: 0.4, transform: 'translateX(4px)', color: 'red'},
                        {offset: 0.5, transform: 'translateX(-4px)', color: 'red'},
                        {offset: 0.6, transform: 'translateX(4px)', color: 'red'},
                        {offset: 0.7, transform: 'translateX(-4px)', color: 'red'},
                        {offset: 0.8, transform: 'translateX(2px)', color: 'red'},
                        {offset: 0.9, transform: 'translateX(-1px)', color: 'red'},
                    ]);
                animation.play();
                return;
            }
        }
        const editedIssue = issue ? { ...issue, title, description, state} : { title, description, state};
        saveIssue && saveIssue(editedIssue).then(() => { setGoBack(true)});
    };
    const handleDelete = () => {
        setGoBack(false);
        const editedIssue = issue ? { ...issue, title, description, state} : { title: '', description:'', state:''};
        deleteIssue && deleteIssue(editedIssue).then(() => { setGoBack(true) });
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {
                        <div slot="start" className={`circle ${networkStatus.connected ? "connected" : "disconnected"}`}/>
                    }
                    <IonTitle>Manage</IonTitle>
                    <IonButtons slot="end">
                        {
                            (issue && issue._id) ?
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
                    <IonLabel position="stacked" className={"title_label"}>Title</IonLabel>
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
