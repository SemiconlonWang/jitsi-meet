// @flow

import JitsiMeetJS from '../lib-jitsi-meet';
import { updateSettings } from '../settings';

/**
 * Get device id of the audio output device which is currently in use.
 * Empty string stands for default device.
 *
 * @returns {string}
 */
export function getAudioOutputDeviceId() {
    return JitsiMeetJS.mediaDevices.getAudioOutputDevice();
}

/**
 * Set device id of the audio output device which is currently in use.
 * Empty string stands for default device.
 *
 * @param {string} newId - New audio output device id.
 * @param {Function} dispatch - The Redux dispatch function.
 * @returns {Promise}
 */
export function setAudioOutputDeviceId(
        newId: string = 'default',
        dispatch: Function): Promise<*> {
    return JitsiMeetJS.mediaDevices.setAudioOutputDevice(newId)
        .then(() =>
            dispatch(updateSettings({
                audioOutputDeviceId: newId
            })));
}

/**
 * Converts an array of media devices into an object organized by device kind.
 *
 * @param {Array<MediaDeviceInfo>} devices - Available media devices.
 * @private
 * @returns {Object} An object with the media devices split by type. The keys
 * are device type and the values are arrays with devices matching the device
 * type.
 */
export function groupDevicesByKind(devices: Object[]): Object {
    return {
        audioInput: devices.filter(device => device.kind === 'audioinput'),
        audioOutput: devices.filter(device => device.kind === 'audiooutput'),
        videoInput: devices.filter(device => device.kind === 'videoinput')
    };
}
