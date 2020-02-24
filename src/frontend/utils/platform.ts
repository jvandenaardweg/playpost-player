export const getPlatform = (navigator: Navigator): 'android' | 'ios' | 'mac' | 'windows' | 'linux' | 'chromeos' | 'other' => {
  // @ts-ignore
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const isWindows = navigator.platform.toUpperCase().indexOf('Win') > -1;
  const isLinux = !isMac && !isWindows && /LINUX/.test(navigator.platform.toUpperCase());
  const isChromeOS = !isMac && !isWindows && !isLinux && /(CrOS)/.test(navigator.userAgent);

  if (/android/i.test(userAgent)) {
    return 'android';
  }

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'ios';
  }

  if (isMac) {
    return 'mac'
  }

  if (isWindows) {
    return 'windows'
  }

  if (isLinux) {
    return 'linux'
  }

  if (isChromeOS) {
    return 'chromeos'
  }

  return 'other';
}
