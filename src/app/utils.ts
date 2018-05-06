/// <reference types="chrome"/>

import ChromePromise from 'chrome-promise';

const chromep: ChromePromise = new ChromePromise();

export async function getExtensionWindowId(): Promise<number> {
  return (await chromep.windows.getCurrent()).id;
}

export async function getExtensionTabId(): Promise<number> {
  return (await chromep.tabs.getCurrent()).id;
}

export function getCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export async function focusExtensionWindow(): Promise<void> {
  const extensionWindowId: number = (await chromep.windows.getCurrent()).id;
  await chromep.windows.update(extensionWindowId,  {'focused': true});
}

export async function focusExtensionTab(): Promise<void> {
  await chromep.tabs.update(await getExtensionTabId(), {'active': true});
}
