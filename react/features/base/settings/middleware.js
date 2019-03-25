// @flow

import { setAudioOnly } from '../conference';
import { parseURLParams } from '../config';
import { SET_LOCATION_URL } from '../connection';
import { getLocalParticipant, participantUpdated } from '../participants';
import { MiddlewareRegistry } from '../redux';

import { updateSettings } from './actions';
import { SETTINGS_UPDATED } from './actionTypes';

/**
 * The middleware of the feature base/settings. Distributes changes to the state
 * of base/settings to the states of other features computed from the state of
 * base/settings.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case SET_LOCATION_URL: {
        const { dispatch, getState } = store;
        const devices = _getDevicesFromURL(getState());

        if (devices) {
            dispatch(updateSettings({
                ...devices
            }));
        }

        break;
    }
    case SETTINGS_UPDATED:
        _maybeSetAudioOnly(store, action);
        _updateLocalParticipant(store, action);
    }

    return result;
});

/**
 * Maps the settings field names to participant names where they don't match.
 * Currently there is only one such field, but may be extended in the future.
 *
 * @private
 * @param {string} settingsField - The name of the settings field to map.
 * @returns {string}
 */
function _mapSettingsFieldToParticipant(settingsField) {
    switch (settingsField) {
    case 'displayName':
        return 'name';
    }

    return settingsField;
}

/**
 * Updates {@code startAudioOnly} flag if it's updated in the settings.
 *
 * @param {Store} store - The redux store.
 * @param {Object} action - The redux action.
 * @private
 * @returns {void}
 */
function _maybeSetAudioOnly(
        { dispatch },
        { settings: { startAudioOnly } }) {
    if (typeof startAudioOnly === 'boolean') {
        dispatch(setAudioOnly(startAudioOnly, true));
    }
}

/**
 * Updates the local participant according to settings changes.
 *
 * @param {Store} store - The redux store.
 * @param {Object} action - The dispatched action.
 * @private
 * @returns {void}
 */
function _updateLocalParticipant({ dispatch, getState }, action) {
    const { settings } = action;
    const localParticipant = getLocalParticipant(getState());
    const newLocalParticipant = {
        ...localParticipant
    };

    for (const key in settings) {
        if (settings.hasOwnProperty(key)) {
            newLocalParticipant[_mapSettingsFieldToParticipant(key)]
                = settings[key];
        }
    }

    dispatch(participantUpdated(newLocalParticipant));
}

/**
 * Bla bla bla.
 *
 * @param {*} state - The redux state.
 * @returns {Object}
 */
function _getDevicesFromURL(state) {
    const urlParams
        = parseURLParams(state['features/base/connection'].locationURL);

    console.error(state['features/base/connection']);
    console.error('Urls params', urlParams);
    const audioOutputDeviceId = urlParams['devices.audioOutput'];
    const cameraDeviceId = urlParams['devices.videoInput'];
    const micDeviceId = urlParams['devices.audioInput'];

    if (!audioOutputDeviceId && !cameraDeviceId && !micDeviceId) {
        return undefined;
    }

    const devices = {};

    audioOutputDeviceId && (devices.audioOutputDeviceId = audioOutputDeviceId);
    cameraDeviceId && (devices.cameraDeviceId = cameraDeviceId);
    micDeviceId && (devices.micDeviceId = micDeviceId);

    return devices;
}
