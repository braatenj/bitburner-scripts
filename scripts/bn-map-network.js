/**
 * Author:  Jacob Braaten
 * Desc:    Maps the network from "home" computer
 * Updated: 8/13/2021
 */

 var servers = ["home"];
 clear("nmap.txt");
 
 for(i = 0; i < servers.length; i++) {
     hostname = servers[i];
     //write server details to file nmap.txt in format hostname,RAM,PortsRequired,RequiredHackLvl,MaxMoney,MinSecurityLvl,GrowLevel
     write("nmap.txt", hostname +
     "," + getServerMaxRam(hostname) +
     "," + getServerNumPortsRequired(hostname) +
     "," + getServerRequiredHackingLevel(hostname) +
     "," + getServerMaxMoney(hostname) +
     "," + getServerMinSecurityLevel(hostname) +
     "," + getServerGrowth(hostname) + 
     "\r\n");
 
     nextScan = scan(hostname);
     for(j=0; j < nextScan.length; j++) {
         if(servers.indexOf(nextScan[j]) == -1) {
             servers.push(nextScan[j]);
         }
     }
 }
 
 
 tprint("Network Mapping Complete. Mapped " + servers.length + " servers.");

