import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { IssueProps } from './IssueProps';

const log = getLogger('issueApi');

const issueUrl = `http://${baseUrl}/api/issue`;


export const getIssues: (token: string, query: string) => Promise<IssueProps[]> = (token, query) => {
    return withLogs(axios.get(`${issueUrl}${query}`, authConfig(token)), 'getIssues');
}

export const createIssue: (token: string, issue: IssueProps) => Promise<IssueProps[]> = (token, issue) => {
    return withLogs(axios.post(issueUrl, issue, authConfig(token)), 'createIssue');
}

export const updateIssue: (token: string, issue: IssueProps) => Promise<IssueProps[]> = (token, issue) => {
    return withLogs(axios.put(`${issueUrl}/${issue._id}`, issue, authConfig(token)), 'updateIssue');
}

export const apideleteIssue: (token: string, issue: IssueProps) => Promise<IssueProps[]> = (token, issue) => {
    return withLogs(axios.delete(`${issueUrl}/${issue._id}`, authConfig(token)), 'apideleteIssue');
}

interface MessageData {
    type: string;
    payload: IssueProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
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
