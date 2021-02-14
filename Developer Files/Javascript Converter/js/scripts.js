window.addEventListener("load", start);

let customRouteFont = false

function start() {
    document.getElementById("build").addEventListener("click", convert)
    document.getElementById("copy").addEventListener("click", copyToClipboard);
}

function copyToClipboard(){
    document.getElementById("output").select();
    document.execCommand("copy");
}

function convert() {
    let contents = document.getElementById("input").value;
    let title = document.getElementById("title").value;
    let version = document.getElementById("version").value;
    //contents = contents.split("\t");
    contents = contents.split("\n");
    for (let i = 0; i < contents.length; i++) {
        contents[i] = contents[i].split("\t");
    }
    output(contents, version, title);
}


function output(desto, version, title) {
    let terminus = "";
    let routes = "";
    let serviceTrip = "";

    for (let i = 0; i < desto.length; i++) {
        let prepayScreen = false;
        let twoScreens = false
        let flip = false

        // Skip if line empty or no Destination set
        if (desto[i].length === 1 || desto[i][4] == "") {
            continue;
        }
        desto[i][1] = desto[i][1].padStart(4,0).insert(3,0);

        // Skip line if doesn't match selected version.
        if (!desto[i][2].includes(version) && desto[i][2] != "") {
            continue;
        }
        
        // Set Service Trip
        if (desto[i][12].includes("%")) {
            serviceTrip = desto[i][4];
            desto[i][12] = desto[i][12].replace("%", "")
        }

        if (desto[i][12].includes("#")) {
            prepayScreen = true;
            desto[i][12] = desto[i][12].replace("#", "");
        }

        if (desto[i][12].includes("^")) {
            prepayScreen = true;
            desto[i][12] = desto[i][12].replace("^", "");
        }

        if (desto[i][14].includes("!")) {
            twoScreens = true;
            desto[i][14] = desto[i][14].replace("!", "");
        }

        if (desto[i][12].includes("*IT")) {
            const split = desto[i][7].split('|');
            terminus += allExit(desto[i][3]); // Exit
            terminus += "\t" + i; // Ziel
            terminus += "\t" + desto[i][4]; // Destination
            terminus += "\t" + IBISOutput (1, version, desto[i]); // Old IBIS
            terminus += "\t" + split[0] + desto[i][13]; // Top Line
            terminus += "\t" + split[1] + desto[i][14]; // Bottom Line
            if (desto[i][0] !== "") {
                terminus += "*L[" + desto[i][0] + "]";
            }
            terminus += "\t" + desto[i][6] + desto[i][12]; // Half Split Line
            terminus += footer (version, desto[i]);
        } else {
            let scrolling = 0;
            let current = 0;
            if (desto[i][8] !== "") {
                if (desto[i][9] !== ""
                    && !desto[i][14].includes("!")) {
                    if (desto[i][10] !== "") {
                        scrolling = 3;
                    } else if (desto[i][11] !== "") {
                        scrolling = 4;
                    } else
                        scrolling = 2;
                } else
                    scrolling = 1;
            }

            while (current <= scrolling) {
                terminus += allExit(desto[i][3]); // Exit
                terminus += "\t";
                terminus += (current * 1000) + i; // Ziel
                terminus += "\t" + desto[i][4]; // Destination
                terminus += "\t" + IBISOutput (1, version, desto[i]); // Old IBIS
                if (current === 1 && twoScreens) {
                    terminus += "\t" + desto[i][8] + desto[i][14]; // Top Line
                    terminus += forceRoute(desto[i][0]);
                    terminus += "\t" + desto[i][9] + desto[i][15]; // Bottom Line
                } else if (flip) {
                    terminus += "\t" + desto[i][7 + current] + desto[i][13 + current]; // Top Line
                    terminus += forceRoute(desto[i][0]);
                    terminus += "\t" + desto[i][6] + desto[i][12]; // Bottom Line
                } else {
                    terminus += "\t" + desto[i][6] + desto[i][12]; // Top Line
                    terminus += forceRoute(desto[i][0]);
                    terminus += "\t" + desto[i][7 + current] + desto[i][13 + current]; // Bottom Line
                }

                if (!desto[i][12].includes("*N") && desto[i][0] == "" && customRouteFont) {
                    terminus += "*CN";
                }
                terminus += footer (version, desto[i]);
                
                current++;
            }
            // Prepay Only
            if (prepayScreen) {
                terminus += allExit(desto[i][3]); // Exit
                terminus += "\t";
                terminus += (current * 1000) + i; // Ziel
                terminus += "\t" + desto[i][4]; // Destination
                terminus += "\t" + IBISOutput (1, version, desto[i]); // Old IBIS
                terminus += "\tPREPAY ONLY*I"; // Top Line
                terminus += forceRoute(desto[i][0]);
                terminus += "\t"; // Bottom Line
                terminus += footer (version, desto[i]);
            }
        }
        
        routes += "[infosystem_trip]\r\n"; //opening tag
        routes += desto[i][1] + "\r\n"; //desto code
        routes += ((desto[i][0] == "") ? desto[i][5] : desto[i][5] + " " + desto[i][0]) + "\r\n"; // Name
        routes += i + "\r\n";
        routes += (desto[i][0]).replace(/\D/g, "");
        routes += "\r\n\r\n[infosystem_busstop_list]\r\n0\r\n\r\n";
    }
    let output = "\tAutogenerated File for use with the Australian Style Desto Controller\r\n\r\n";
    output += "[name]\r\n" + title + "\r\n\r\n";
    output += "[servicetrip]\r\n" + serviceTrip + "\r\n\r\n";
    output += "[global_strings]\r\n0\r\n\r\n";
    output += "stringcount_terminus\r\n5\r\n\r\n";
    output += "stringcount_busstop\r\n0\r\n\r\n";
    output += "[addterminus_list]\r\n";
    output += terminus;
    if (customRouteFont) {
        output += "	14994	Custom number	BT_Numbers_Old					\r\n";
        output += "	14998	Custom number	BT_Numbers_Old					\r\n";
    }
    output += "[end]\r\n\r\n[addbusstop_list]\r\n[end]\r\n\r\n";
    output += routes;
    document.getElementById("output").value = output;
}

function IBISOutput (IBISversion, Depot, Desto) {
    var output = "";
    const NSWDepots = ["N", "V", "T"];
    if (NSWDepots.includes(Depot)) {
        output = (Desto[0] == "") ? Desto[5] : Desto[0] + " " + Desto[5];
        // Destination / Number + Destination
    } else {
        output = (Desto[0] == "") ? Desto[5] : Desto[5] + " " + Desto[0];
        // Destination / Destination + Number
    }
    
    switch (IBISversion) {
        case 1:
            return output.toUpperCase();
        case 2:
        default:
            return output;
    }
}

function forceRoute(RouteNumber) {
    return (RouteNumber !== "") ? ("*L[" + RouteNumber + "]") : "";
}

function allExit(value) {
    return (value !== "") ? "{ALLEX}" : "";
}

function footer (version, desto) {
    let terminus = "";
    terminus += "\t"; // Half Split Line
    terminus += "\t"; // Roller Img
    terminus += "\t" + IBISOutput (2, version, desto); // IBIS 2
    terminus += "\r\n";
    return terminus;
}

//https://stackoverflow.com/a/9160869
String.prototype.insert = function(index, string) {
    if (index > 0) {
      return this.substring(0, index) + string + this.substr(index);
    }
  
    return string + this;
  };