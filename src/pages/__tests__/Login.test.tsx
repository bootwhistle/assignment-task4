import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import { AuthenticationContext } from '../../context/AuthenticationContext';
import * as api from '../../services/api';

// Test doubles: no real server, cache or navigation stack is needed to test the screen.
jest.mock('../../services/api', () => ({
    authenticateUser: jest.fn(),
}));

jest.mock('../../services/caching', () => ({
    getFromCache: jest.fn(() => Promise.resolve(null)),
    setInCache: jest.fn(() => Promise.resolve()),
}));

// RectButton is native code; this stand-in behaves like it on a device:
// presses do nothing when enabled is false.
jest.mock('react-native-gesture-handler', () => {
    const React = require('react');
    const { Pressable } = require('react-native');
    return {
        RectButton: ({ enabled = true, children, ...props }: any) =>
            React.createElement(Pressable, { ...props, disabled: !enabled }, children),
    };
});

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useIsFocused: () => true,
}));

const authenticateUser = api.authenticateUser as jest.Mock;

const luigi = {
    id: 'gpFfX6e',
    email: 'luigi@carluccio.it',
    name: { first: 'Luigi', last: 'Carluccio' },
    mobile: '(171) 946-2538',
};

async function renderLogin() {
    const navigation = { navigate: jest.fn() };
    const setValue = jest.fn();

    await render(
        <AuthenticationContext.Provider value={{ value: undefined as any, setValue }}>
            <Login navigation={navigation as any} route={{ key: 'Login', name: 'Login' } as any} />
        </AuthenticationContext.Provider>
    );

    return { navigation, setValue };
}

async function fillForm(email: string, password: string) {
    await fireEvent.changeText(screen.getByLabelText('Email'), email);
    await fireEvent(screen.getByLabelText('Email'), 'endEditing');
    await fireEvent.changeText(screen.getByLabelText('Password'), password);
    await fireEvent(screen.getByLabelText('Password'), 'endEditing');
}

describe('Login screen', () => {
    beforeEach(() => {
        authenticateUser.mockReset();
    });

    it('disables Log in while the form is empty', async () => {
        await renderLogin();

        expect(screen.getByLabelText('Log in')).toBeDisabled();
    });

    it('keeps Log in disabled until both fields are filled in', async () => {
        await renderLogin();

        await fireEvent.changeText(screen.getByLabelText('Email'), 'luigi@carluccio.it');
        expect(screen.getByLabelText('Log in')).toBeDisabled();

        await fireEvent.changeText(screen.getByLabelText('Password'), '123456');
        expect(screen.getByLabelText('Log in')).toBeEnabled();
    });

    it.each(['luigi@carluccio.it', 'john@silva.com.br', 'eva.young@example.com'])(
        'logs in a seed user with a valid email: %s',
        async (email) => {
            authenticateUser.mockResolvedValue({ data: { user: { ...luigi, email }, accessToken: 'token' } });
            const { navigation } = await renderLogin();

            await fillForm(email, '123456');
            expect(screen.queryByText('invalid email')).toBeNull();

            await fireEvent.press(screen.getByLabelText('Log in'));

            await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('EventsMap'));
            expect(authenticateUser).toHaveBeenCalledWith(email, '123456');
        }
    );

    it('sends the trimmed, lower-case email', async () => {
        authenticateUser.mockResolvedValue({ data: { user: luigi, accessToken: 'token' } });
        await renderLogin();

        await fillForm('  Luigi@Carluccio.IT ', '123456');
        await fireEvent.press(screen.getByLabelText('Log in'));

        await waitFor(() => expect(authenticateUser).toHaveBeenCalledWith('luigi@carluccio.it', '123456'));
    });

    it('flags an invalid email and does not call the API', async () => {
        await renderLogin();

        await fillForm('luigi@carluccio', '123456');
        await fireEvent.press(screen.getByLabelText('Log in'));

        expect(screen.getByText('invalid email')).toBeTruthy();
        expect(authenticateUser).not.toHaveBeenCalled();
    });

    it('flags a short password and does not call the API', async () => {
        await renderLogin();

        await fillForm('luigi@carluccio.it', '123');
        await fireEvent.press(screen.getByLabelText('Log in'));

        expect(screen.getByText('invalid password')).toBeTruthy();
        expect(authenticateUser).not.toHaveBeenCalled();
    });
});
