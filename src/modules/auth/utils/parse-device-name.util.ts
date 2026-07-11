import { UAParser } from 'ua-parser-js';

export const parseDeviceName = (userAgent: string): string => {
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const browserName = browser.name ?? 'Unknown browser';
  const osName = os.name ?? 'Unknown OS';

  return `${browserName} / ${osName}`;
};
