export function getClientInfo() {
  if (typeof window === "undefined") return {};

  const ua = navigator.userAgent || "";

  let deviceType = "Desktop";
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceType = "Mobile";
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceType = "Tablet";
  }

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opr\//i.test(ua)) browser = "Opera";

  let engine = "Unknown";
  if (/applewebkit/i.test(ua)) engine = "WebKit";
  if (/gecko\//i.test(ua) && !/applewebkit/i.test(ua)) engine = "Gecko";
  if (/chrome\//i.test(ua) || /edg\//i.test(ua)) engine = "Blink";

  return {
    deviceType,
    browser,
    engine,
    platform: navigator.platform || null,
    screenWidth: window.innerWidth || null,
    userAgent: ua.slice(0, 500),
  };
}
