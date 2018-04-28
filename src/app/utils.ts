/// <reference types="chrome"/>

import ChromePromise from 'chrome-promise';

const chromep: ChromePromise = new ChromePromise();

export function getCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export async function focusExtensionWindow(): Promise<void> {
  const extensionWindowId: number = (await chromep.windows.getCurrent()).id;
  await chromep.windows.update(extensionWindowId,  {'focused': true});
}

export async function focusExtensionTab(): Promise<void> {
  const extensionTabId: number = (await chromep.tabs.getCurrent()).id;
  await chromep.tabs.update(extensionTabId, {'active': true});
}
