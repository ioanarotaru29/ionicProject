import axios from 'axios';
import { getLogger } from '../core';
import { IssueProps } from './IssueProps';

const log = getLogger('issueApi');

const baseUrl = 'localhost:3000';
const issueUrl = `http://${baseUrl}/issue`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getIssues: () => Promise<IssueProps[]> = () => {
    return withLogs(axios.get(issueUrl, config), 'getIssues');
}

export const createIssue: (issue: IssueProps) => Promise<IssueProps[]> = issue => {
    return withLogs(axios.post(issueUrl, issue, config), 'createIssue');
}

export const updateIssue: (issue: IssueProps) => Promise<IssueProps[]> = issue => {
    return withLogs(axios.put(`${issueUrl}/${issue.id}`, issue, config), 'updateIssue');
}

export const apideleteIssue: (issue: IssueProps) => Promise<IssueProps[]> = issue => {
    return withLogs(axios.delete(`${issueUrl}/${issue.id}`, config), 'apideleteIssue');
}

interface MessageData {
    event: string;
    payload: {
        issue: IssueProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
