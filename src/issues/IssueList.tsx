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
    IonToolbar, useIonViewDidEnter, useIonViewWillEnter
} from '@ionic/react';
import {add } from 'ionicons/icons';
import Issue from './Issue';
import { getLogger, Storage } from '../core';
import { IssueContext } from './IssueProvider';
import {IssueProps} from "./IssueProps";

const log = getLogger('IssueList');

const IssueList: React.FC<RouteComponentProps> = ({ history }) => {
    const { issues, fetching, fetchingError } = useContext(IssueContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
    const [filterIssues, setFilterIssues] = useState<string>('');
    const [issuesSlice, setIssuesSlice] = useState<IssueProps[] | undefined>([]);
    const [page, setPage ] = useState<number>(1);

    const offset = 10;

    log('render');

    useEffect( () =>{
        log("use effect");
        const slice = issues?.slice(0, offset);
        setIssuesSlice(slice);
        return;
        },[issues]
    )

    useIonViewDidEnter( async () => {

    })

    async function searchNext($event: CustomEvent<void>) {
        log("search next")
        if(issuesSlice?.length !== issues?.length){
            const slice = issues?.slice(page*offset, (page+1)*offset);
            // @ts-ignore
            if(slice?.length < offset) {
                setDisableInfiniteScroll(true);
            }
            else {
                setDisableInfiniteScroll(false);
            }
            // @ts-ignore
            setIssuesSlice(issuesSlice?.concat(slice));
            setPage(prevState => prevState+1)
        }
        else{
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

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
                {issuesSlice && (
                    <IonList>
                        {issuesSlice.filter(({ _id, title, description,state}) => title.toLowerCase().includes(filterIssues.toLowerCase())).map(({ _id, title, description,state}) =>
                            <Issue key={_id} _id={_id} title={title} description={description} state={state} onEdit={id => history.push(`/issue/${id}`)} />)}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                                   onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more issues...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
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
