import qs from "querystringify";
export function locationToRoute(location) {
  // location comes from the history package or window.location
  console.log('locationToRoute input:', location);
  const result = {
    path: location.pathname,
    hash: location.hash,
    query: qs.parse(location.search),
  };
  console.log('locationToRoute output:', result);
  return result;
}
