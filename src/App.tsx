import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { IssueEdit, IssueList } from './issues';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { IssueProvider } from './issues/IssueProvider';

const App: React.FC = () => (
    <IonApp>
        <IssueProvider>
            <IonReactRouter>
                <IonRouterOutlet>
                    <Route path="/issues" component={IssueList} exact={true} />
                    <Route path="/issue" component={IssueEdit} exact={true} />
                    <Route path="/issue/:id" component={IssueEdit} exact={true} />
                    <Route exact path="/" render={() => <Redirect to="/issues" />} />
                </IonRouterOutlet>
            </IonReactRouter>
        </IssueProvider>
    </IonApp>
);

export default App;
