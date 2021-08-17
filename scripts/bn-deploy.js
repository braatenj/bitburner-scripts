/**
 * Author:  Jacob Braaten
 * Desc:    copy the file contents below into a new script and then run it, everything else will be done from there.
 *          script expects a single arguement and that is the phase 
 * Updated: 8/13/2021
 */




export async function main(ns) {
    var data = ns.flags([
        ['phase', 1], //default phase 1 is fresh start, will jump to phase 2 after certain functions become available and bot can be more efficient
        ['rootURL', 'https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts'], //default starting path for file downloads
    ]);
    
    var filesToDownload = ["/phase1/bn-daemon.js", "/phase1/bn-hack-host.js", "/phase1/bn-prep-host.js", "/phase2/bn-daemon.js", "/phase2/bn-host-manager.js"];
    var host = ns.getHostname();
    if(host != "home") {
        ns.tprint("Exiting bn-deploy.js must be run on 'home' host!");
        return;
    }

    /*
    await ns.wget("https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts/phase1/bn-daemon.js", "/scripts/phase1/bn-daemon.js");
    await ns.wget("https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts/phase1/bn-hack-host.js", "/scripts/phase1/bn-hack-host.js");
    await ns.wget("https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts/phase1/bn-prep-host.js", "/scripts/phase1/bn-prep-host.js");
    await ns.wget("https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts/phase2/bn-daemon.js", "/scripts/phase2/bn-daemon.js");
    await ns.wget("https://raw.githubusercontent.com/braatenj/bitburner-scripts/main/scripts/phase2/bn-host-manager.js", "/scripts/phase2/bn-host-manager.js");
    */


    for(var i = 0; i < filesToDownload.length; i++) {
        //ns.tprint("Attempting to download file: " + data.rootURL + filesToDownload[i]);
        await ns.wget(data.rootURL + filesToDownload[i], "/scripts" + filesToDownload[i]);
        await ns.sleep(500);
    }

    if(data.phase == 1) {
        if(allFilesDownloaded(ns)) {
            ns.run("/scripts/phase1/bn-daemon.js");
        }
    }
}

function doesFileExistOnServer(ns, file, serverName) {
    return ns.fileExists(file, serverName);
}

function allFilesDownloaded(ns) {
    var value = true;
    for(var i = 0; i < filesToDownload.length; i++) {
        if(!doesFileExistOnServer(ns, "/scripts" + filesToDownload[i], "home")) {
            value = false;
        }
    }
    return value;
}

