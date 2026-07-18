import { UAParser } from 'ua-parser-js';

export const parseDeviceName = (userAgent: string): string => {
  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const osName = os.name ?? 'Unknown OS';

  if (device.model) {
    const osLabel = os.version ? `${osName} ${os.version}` : osName;
    return `${device.model} / ${osLabel}`;
  }

  const browser = parser.getBrowser();
  const browserName = browser.name ?? 'Unknown browser';
  return `${browserName} / ${osName}`;
};
