import type {
  ApiInitialArgs,
  ApiOnProgress,
  OnApiUpdate,
} from '../../types';
import type { LocalDb } from '../localDb';
import type { MethodArgs, MethodResponse, Methods } from './types';

import { updateFullLocalDb } from '../localDb';
import { init as initUpdateEmitter } from '../updates/apiUpdateEmitter';
import { init as initClient } from './client';
import * as methods from './index';

export function initApi(_onUpdate: OnApiUpdate, initialArgs: ApiInitialArgs, initialLocalDb?: LocalDb) {
  onUpdate = _onUpdate;

  if (!initialArgs.sessionData) {
    // @ts-ignore;
    const localStorageData = initialArgs.localStorageData || {};
    // @ts-ignore;
    const userAuth = localStorageData?.userAuth;
    if (userAuth) {
      try {
        const mainDcId = Number(userAuth.dcID);

        const result = {
          mainDcId,
          keys: {

          },
          hashes: {

          },
          isLocalStorage: true,
        };
        [1, 2, 3, 4, 5].forEach((dcId) => {
          try {
            const key = localStorageData[`dc${dcId}_auth_key`];
            if (key) {
              // @ts-ignore
              result.keys[dcId] = key;
            }

            const hash = localStorageData[`dc${dcId}_hash`];
            if (hash) {
              // @ts-ignore
              result.hashes[dcId] = hash;
            }
          } catch (err) {
            console.log('err:', err);
          }
        });
        // @ts-ignore;
        const entourage = localStorageData.user_entourage;
        // @ts-ignore;
        if (entourage?.apiId && entourage?.apiHash) {
        // @ts-ignore;
          result.initConnectionParams = entourage || {};
          // @ts-ignore;
          result.apiId = entourage.apiId;
          // @ts-ignore;
          result.apiHash = entourage.apiHash;
        }
        initialArgs.sessionData = result;
      } catch (error) {
        console.log('initConnectionParams error:', error);
      }
    }
  }

  initUpdateEmitter(_onUpdate);
  // console.log('src/api/gramjs/methods/init.ts initialArgs:', initialArgs);

  // initUpdater(handleUpdate);
  // initAuth(handleUpdate);
  // initChats(handleUpdate);
  // initMessages(handleUpdate);
  // initUsers(handleUpdate);
  // initStickers(handleUpdate);
  // initManagement(handleUpdate);
  // initTwoFaSettings(handleUpdate);
  // initBots(handleUpdate);
  // initCalls(handleUpdate);
  // initPayments(handleUpdate);

  if (initialLocalDb) updateFullLocalDb(initialLocalDb);

  // IMPORTANT: Do not await this, or login will not work
  initClient(initialArgs);
}

export function callApi<T extends keyof Methods>(fnName: T, ...args: MethodArgs<T>): MethodResponse<T> {
  // @ts-ignore
  return methods[fnName](...args) as MethodResponse<T>;
}

export function cancelApiProgress(progressCallback: ApiOnProgress) {
  progressCallback.isCanceled = true;
}
