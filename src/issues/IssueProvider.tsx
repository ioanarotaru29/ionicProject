import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger, Storage } from '../core';
import { IssueProps } from './IssueProps';
import {createIssue, apideleteIssue, getIssues, newWebSocket, updateIssue} from './issueApi';
import { AuthContext } from '../auth';

const log = getLogger('IssueProvider');

type SaveIssueFn = (issue: IssueProps) => Promise<any>;
type DeleteIssueFn = (issue: IssueProps) => Promise<any>;

export interface IssuesState {
    issues?: IssueProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveIssue?: SaveIssueFn,
    deleting: boolean,
    deletingError?: Error | null,
    deleteIssue?: DeleteIssueFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: IssuesState = {
    fetching: false,
    saving: false,
    deleting: false,
};

const FETCH_ISSUES_STARTED = 'FETCH_ISSUES_STARTED';
const FETCH_ISSUES_SUCCEEDED = 'FETCH_ISSUES_SUCCEEDED';
const FETCH_ISSUES_FAILED = 'FETCH_ISSUES_FAILED';
const SAVE_ISSUE_STARTED = 'SAVE_ISSUE_STARTED';
const SAVE_ISSUE_SUCCEEDED = 'SAVE_ISSUE_SUCCEEDED';
const SAVE_ISSUE_FAILED = 'SAVE_ISSUE_FAILED';
const DELETE_ISSUE_STARTED = 'DELETE_ISSUE_STARTED';
const DELETE_ISSUE_SUCCEEDED = 'DELETE_ISSUE_SUCCEEDED';
const DELETE_ISSUE_FAILED = 'DELETE_ISSUE_FAILED';

const reducer: (state: IssuesState, action: ActionProps) => IssuesState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ISSUES_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ISSUES_SUCCEEDED:
                return { ...state, issues: payload.issues, fetching: false };
            case FETCH_ISSUES_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ISSUE_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ISSUE_SUCCEEDED:
                const issues = [...(state.issues || [])];
                const issue = payload.issue;
                const index = issues.findIndex(it => it._id === issue._id);
                if (index === -1) {
                    issues.splice(0, 0, issue);
                } else {
                    issues[index] = issue;
                }
                return { ...state, issues, saving: false };
            case SAVE_ISSUE_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            case DELETE_ISSUE_STARTED:
                return { ...state, deletingError: null, deleting: true };
            case DELETE_ISSUE_SUCCEEDED:
                const initial_issues = [...(state.issues || [])];
                const deleted_issue = payload.issue;
                const deleted_index = initial_issues.findIndex(it => it._id === deleted_issue._id);
                if (deleted_index !== -1) {
                    initial_issues.splice(deleted_index, 1);
                }
                console.log(initial_issues);
                return { ...state, issues: initial_issues, deleting: false };
            case DELETE_ISSUE_FAILED:
                return { ...state, deletingError: payload.error, deleting: false };
            default:
                return state;
        }
    };

export const IssueContext = React.createContext<IssuesState>(initialState);

interface IssueProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const IssueProvider: React.FC<IssueProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { issues, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
    useEffect(getIssuesEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveIssue = useCallback<SaveIssueFn>(saveIssueCallback, [token]);
    const deleteIssue = useCallback<DeleteIssueFn>(deleteIssueCallback, [token]);
    const value = { issues, fetching, fetchingError, saving, savingError, saveIssue, deleting, deletingError, deleteIssue };
    log('returns');
    return (
        <IssueContext.Provider value={value}>
            {children}
        </IssueContext.Provider>
    );

    function getIssuesEffect() {
        let canceled = false;
        fetchIssues();
        return () => {
            canceled = true;
        }

        async function fetchIssues() {
            if (!token?.trim()) {
                return;
            }
            const ret = await Storage.get({key: "issues"});
            if(ret.value!=null){
                const issues = JSON.parse(ret.value);
                dispatch({ type: FETCH_ISSUES_SUCCEEDED, payload: { issues } });
                return;
            }
            try {
                log('fetchIssues started');
                dispatch({ type: FETCH_ISSUES_STARTED });
                const issues = await getIssues(token);
                log('fetchIssues succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ISSUES_SUCCEEDED, payload: { issues } });
                    await Storage.set({key: "issues", value: JSON.stringify(issues)});
                }
            } catch (error) {
                log('fetchIssues failed');
                dispatch({ type: FETCH_ISSUES_FAILED, payload: { error } });
            }
        }
    }

    async function saveIssueCallback(issue: IssueProps) {
        try {
            log('saveIssue started');
            dispatch({ type: SAVE_ISSUE_STARTED });
            const savedIssue = await (issue._id ? updateIssue(token, issue) : createIssue(token, issue));
            log('saveIssue succeeded');
            dispatch({ type: SAVE_ISSUE_SUCCEEDED, payload: { issue: savedIssue } });
            await Storage.set({key: "issues", value: JSON.stringify(issues)});
        } catch (error) {
            log('saveIssue failed');
            dispatch({ type: SAVE_ISSUE_FAILED, payload: { error } });
        }
    }

    async function deleteIssueCallback(issue: IssueProps) {
        try {
            log('deleteIssue started');
            dispatch({ type: DELETE_ISSUE_STARTED });
            const deleted_issue = await apideleteIssue(token, issue);
            log('deleteIssue succeeded');
            dispatch({ type: DELETE_ISSUE_SUCCEEDED, payload: { issue: issue } });
            await Storage.set({key: "issues", value: JSON.stringify(issues)});
        } catch (error) {
            log('deleteIssue failed');
            dispatch({ type: DELETE_ISSUE_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: issue} = message;
                log(`ws message, issue ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_ISSUE_SUCCEEDED, payload: {issue}});
                    Storage.set({key: "issues", value: JSON.stringify(issues)});
                }
                if (type === 'deleted') {
                    dispatch({type: DELETE_ISSUE_SUCCEEDED, payload: {issue}});
                    Storage.set({key: "issues", value: JSON.stringify(issues)});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};