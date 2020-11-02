import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { IssueProps } from './IssueProps';

interface IssuePropsExt extends IssueProps {
    onEdit: (id?: string) => void;
}

const Issue: React.FC<IssuePropsExt> = ({ id, title, description, state, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{title}</IonLabel>
            <IonLabel>{description}</IonLabel>
            <IonLabel>{state}</IonLabel>
        </IonItem>
    );
};

export default Issue;
