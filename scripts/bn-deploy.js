/**
 * Author:  Jacob Braaten
 * Desc:    copy the file contents below into a new script and then run it, everything else will be done from there.
 *          script expects a single arguement and that is the phase 
 * Updated: 8/13/2021
 */


var data = flags([
    ['phase', 1], //default phase 1 is fresh start, will jump to phase 2 after certain functions become available and bot can be more efficient
    ['rootURL', 'raw.githubusercontent.com/braatenj/bitburner-scripts/main/'], //default starting path for file downloads
]);

var filesToDownload = [""];

export async function main(ns) {
    var host = ns.getHostname();
    if(host != "home") {
        return;
    }

    await ns.wget(data.rootURL)
}

