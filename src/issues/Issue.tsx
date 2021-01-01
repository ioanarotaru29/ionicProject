import React, {useEffect} from 'react';
import { IonItem, IonLabel, createAnimation } from '@ionic/react';
import { IssueProps } from './IssueProps';

interface IssuePropsExt extends IssueProps {
    onEdit: (_id?: string) => void;
}

const Issue: React.FC<IssuePropsExt> = ({ _id, title, description, state, onEdit }) => {
    useEffect(() => {
        const title = createAnimation()
            .addElement(document.querySelectorAll('.title'))
            .fill('none')
            .duration(500)
            .fromTo('transform', 'translateX(100px)', 'translateX(0px)')
            .fromTo('opacity', '0', '1');

        const description = createAnimation()
            .addElement(document.querySelectorAll('.description'))
            .fill('none')
            .duration(1000)
            .fromTo('transform', 'translateX(100px)', 'translateX(0px)')
            .fromTo('opacity', '0', '1');

        const state = createAnimation()
            .addElement(document.querySelectorAll('.state'))
            .fill('none')
            .duration(1500)
            .fromTo('transform', 'translateX(100px)', 'translateX(0px)')
            .fromTo('opacity', '0', '1');

        const parentAnimation = createAnimation()
            .duration(10000)
            .beforeStyles({
                opacity: '0'
            })
            .addAnimation([title, description, state]);
        parentAnimation.play();

    }, [])

    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel className={'title'}>{title}</IonLabel>
            <IonLabel className={'description'}>{description}</IonLabel>
            <IonLabel className={'state'}>{state}</IonLabel>
        </IonItem>
    );
};

export default Issue;
