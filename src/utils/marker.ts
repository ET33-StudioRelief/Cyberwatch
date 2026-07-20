import markerSDK from '@marker.io/browser';

export async function launchMarkerSDK() {
  const widget = await markerSDK.loadWidget({
    project: '6a54e71b66f660d2dcf16d9e',
  });
  return widget;
}
