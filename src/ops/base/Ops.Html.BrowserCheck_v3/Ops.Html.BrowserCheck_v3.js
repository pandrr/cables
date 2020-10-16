const
    isMobile = op.outBool("Is Mobile", false),
    isIe = op.outBool("Is IE", false),
    isEdge = op.outBool("Is Edge", false),
    isChrome = op.outBool("Is Chrome", false),
    isFirefox = op.outBool("Is Firefox", false),
    isOpera = op.outBool("Is Opera", false),
    isSafari = op.outBool("Is Safari", false),
    isWindows = op.outBool("Is Windows", false),
    isLinux = op.outBool("Is Linux", false),
    isMac = op.outBool("Is Mac", false),
    isIos = op.outBool("Is iOS", false),
    isAndroid = op.outBool("Is Android", false),
    isElectron = op.outBool("Is Electron", false),
    outOS = op.outString("Operating System", ""),
    outBrowserName = op.outString("Browser Name", ""),
    outVersion = op.outString("OS Version", ""),
    outNav = op.outString("Language"),
    outUA = op.outString("User Agent");

op.setPortGroup("Browsers", [isIe, isEdge, isChrome, isFirefox, isOpera, isSafari]);
op.setPortGroup("Operating Systems", [isWindows, isLinux, isMac, isIos, isAndroid, isElectron]);
op.setPortGroup("Textual Information", [outOS, outBrowserName, outNav, outVersion, outUA]);
const pf = platform;

const osFamily = pf.os.family;

const isOperaBool = pf.name === "Opera";
const isSafariBool = pf.name === "Safari";
const isIEBool = pf.name === "IE";
const isEdgeBool = pf.name === "Microsoft Edge";
const isChromeBool = pf.name === "Chrome" || pf.name === "Chrome Mobile";
const isBlinkBool = pf.layout === "Blink";
const isFirefoxBool = pf.name === "Firefox" || pf.name === "Firefox Mobile" || pf.name === "Firefox for iOS";

const isLinuxBool = osFamily === "Linux"
    || osFamily === "Ubuntu"
    || osFamily === "SuSE"
    || osFamily === "Fedora"
    || osFamily === "OpenBSD"
    || osFamily === "Debian"
    || osFamily === "Red Hat";

const isMacBool = osFamily === "Mac" || osFamily === "Macintosh" || osFamily === "Mac OS X" || osFamily === "OS X";
const isWindowsBool = osFamily === "Windows" || osFamily === "Windows 98;";
const isAndroidBool = osFamily === "Android";
const isIosBool = osFamily === "iOS";
const isMobileBool = (osFamily === "webOS" // LG mobile phones
    || osFamily === "Windows Phone"
    || osFamily === "Android"
    || osFamily === "iOS")
    ||
    (pf.name === "Chrome Mobile"
    || pf.name === "Firefox for iOS"
    || pf.name === "Firefox Mobile"
    || pf.name === "IE Mobile"
    || pf.name === "Opera Mobile");
const isElectronBool = pf.name === "Electron";


isMobile.set(isMobileBool);

isIe.set(isIEBool);
isEdge.set(isEdgeBool);
isChrome.set(isChromeBool);
isFirefox.set(isFirefoxBool);
isOpera.set(isOperaBool);
isSafari.set(isSafariBool);

isMac.set(isMacBool);
isLinux.set(isLinuxBool);
isWindows.set(isWindowsBool);
isIos.set(isIosBool);
isAndroid.set(isAndroidBool);
isElectron.set(isElectronBool);


outNav.set(navigator.language || navigator.userLanguage);
outUA.set(pf.ua);
outVersion.set(pf.os.version);
outOS.set(pf.os.toString());
outBrowserName.set(pf.name);
