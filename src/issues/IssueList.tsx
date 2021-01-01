import React, {useContext, useEffect, useState} from 'react';
import { RouteComponentProps} from 'react-router';
import {
    createAnimation,
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonList, IonLoading,
    IonPage, IonSearchbar,
    IonTitle,
    IonToolbar, useIonViewDidEnter
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Issue from './Issue';
import { getLogger, Storage } from '../core';
import { IssueContext } from './IssueProvider';
import {useNetwork} from "../core/useNetwork";

const log = getLogger('IssueList');

const IssueList: React.FC<RouteComponentProps> = ({ history }) => {
    const { issues, fetching, fetchingError, filterIssue, filterString, pageIssue, crtPage} = useContext(IssueContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

    const { networkStatus }  = useNetwork();

    log('render');

    useIonViewDidEnter( async () => {

    })

    useEffect(() => {
        const circle = document.querySelector('.circle');
        if(circle) {
            const animation = createAnimation()
                // @ts-ignore
                .addElement(circle)
                .duration(500)
                .fromTo('background', networkStatus.connected ? 'darkred' : 'green', networkStatus.connected ? 'green' : 'darkred')
                .afterRemoveClass(networkStatus.connected ? 'disconnected' : 'connected')
                .afterAddClass(networkStatus.connected ? 'connected' : 'disconnected');
            animation.play();
        }
    }, [networkStatus.connected])

    async function searchNext($event: CustomEvent<void>) {
        log("search next")
        if (pageIssue) {
            await pageIssue(crtPage + 1)
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    const handleLogout = () => {
        Storage.clear();
        window.location.reload();
    }

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.loading-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0) translateY(150px) rotateX(180deg)' },
                { offset: 1, opacity: '1', transform: 'scale(1) translateY(0px) rotateX(0deg)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-in-out')
            .duration(1000)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    {
                        <div slot="start" className={`circle`} />
                    }
                    <IonTitle>Issues List</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleLogout}>Logout</IonButton>
                    </IonButtons>

                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonSearchbar
                    value={filterString}
                    debounce={100}
                    disabled={!networkStatus.connected}
                    onIonChange={e => filterIssue && filterIssue(e.detail.value!) && setDisableInfiniteScroll(false)}>
                </IonSearchbar>
                <IonLoading enterAnimation={ enterAnimation} leaveAnimation={leaveAnimation} isOpen={fetching} message="Fetching issues" />
                {issues && (
                    <IonList>
                        {issues.map(({ _id, title, description,state}) =>
                            <Issue key={_id} _id={_id} title={title} description={description} state={state} onEdit={id => history.push(`/issue/${id}`)} />)}
                    </IonList>
                )}
                <IonInfiniteScroll threshold="100px" disabled={!networkStatus.connected}
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
