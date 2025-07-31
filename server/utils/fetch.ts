import {$Fetch, $fetch} from "ofetch"
import { ProxyAgent } from "undici";
import process from "node:process";

const COMMON_PARAMS = {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
};

const HTTP_PROXY = process.env.HTTP_PROXY;
const HTTPS_PROXY = process.env.HTTPS_PROXY;
const PROXY_LINKS = (process.env.PROXY_LINKS || '').split(',');

const proxyHttpAgent = HTTP_PROXY && new ProxyAgent(HTTP_PROXY);
const proxyHttpsAgent = HTTPS_PROXY && new ProxyAgent(HTTPS_PROXY);

export const baseMyyFetch = $fetch.create(COMMON_PARAMS)

// @ts-ignore
export const myFetch: $Fetch = (url, options, ...restParams) => {
  const needProxy = PROXY_LINKS.some(item => {
    if (typeof url === 'string') {
      return url.includes(item);
    }

    return false;
  });

  if (!needProxy) {
    return baseMyyFetch(url, options, ...restParams);
  }

  const isHttps = typeof url === 'string' && url.startsWith('https');
  if (isHttps) {
    return baseMyyFetch(url, {
      ...options,
      // @ts-ignore
      dispatcher: proxyHttpsAgent ? proxyHttpsAgent : undefined
    }, ...restParams)
  }

  return baseMyyFetch(url, {
    ...options,
    // @ts-ignore
    dispatcher: proxyHttpAgent ? proxyHttpAgent : undefined
  }, ...restParams);
}
