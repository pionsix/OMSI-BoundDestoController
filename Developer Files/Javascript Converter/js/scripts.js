window.addEventListener("load", start);
let GlobalHannoverDestoCodes = [];

function start() {
    document.getElementById("build").addEventListener("click", convert)
    document.getElementById("copy").addEventListener("click", copyToClipboard);
}

function convert() {
    let contents = document.getElementById("input").value;
    let title = document.getElementById("title").value;
    let version = document.getElementById("version").value;
    let hanover = document.getElementById("hanover").checked;
    let customFont = document.getElementById("customFonts").checked;

    //contents = contents.split("\t");
    contents = contents.split("\n");
    for (let i = 0; i < contents.length; i++) {
        contents[i] = contents[i].split("\t");
    }
    output(contents, version, title, hanover, customFont);
}

function output(contents, version, title, hanover, customFont) {
    let [terminus, serviceTrip, routes] = generateDestoData(contents, version, title, hanover, customFont);

    let output = (hanover) ?
        generateHeader("Studio Polygon EG3 Controller with Scrolling Mod",title,serviceTrip)
        : generateHeader("Citaro RHD with Controller Mod",title,serviceTrip);

    output += terminus;
    output += (customFont && !hanover) ?
        "	14994	Custom number	BT_Numbers_Old					\r\n"
        + "	14998	Custom number	BT_Numbers_Old					\r\n"
        : "";
    output += "[end]\r\n\r\n[addbusstop_list]\r\n[end]\r\n\r\n";
    output += routes;
    document.getElementById("output").value = output;
}

function generateDestoData(desto, version, title, hanover, customFont) {
    let terminus = "";
    let routes = "";
    let serviceTrip = "";

    for (let i = 0; i < desto.length; i++) {
        let prepayScreen = false;
        let twoScreens = false
        let flip = false
        let split = false;
        let IBISDesto = "";
        let rearSmallTop = ""
        let rearSmallBottom = ""

        // Skip if line empty or no Destination set
        if (desto[i].length === 1 || desto[i][4] == "") {
            continue;
        }

        // Skip if version doesn't match selection
        if (!desto[i][2].includes(version) && desto[i][2] != "") {
            continue;
        }

        const fixedDestoCode = (desto[i][20] == "") ? false : true;

        IBISDesto = desto[i][1].padStart(4, "0").insert(3, 0);

        if (typeof desto[i][18] != "undefined") {
            const splitRear = desto[i][18].split('|');
            rearSmallTop = splitRear[0]
            rearSmallBottom = splitRear[1]
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
            flip = true;
            desto[i][12] = desto[i][12].replace("^", "");
        }

        if (desto[i][14].includes("!")) {
            twoScreens = true;
            desto[i][14] = desto[i][14].replace("!", "");
        }

        if (desto[i][12].includes("*IT")) {
            split = true;
        }
        if (split) {
            const splitParts = desto[i][7].split('|');
            // Converts Split Screen into two screens
            if (hanover) {
                const mergedLines = splitParts[0] + " " + splitParts[1]
                terminus += outputHanoverDestoLine(
                    desto[i][3],
                    generateHanoverScroll(desto[i][1], desto[i][0], fixedDestoCode, 0, 1),
                    desto[i][4],
                    IBISOutput(2, version, desto[i]),
                    desto[i][6],
                    "",
                    desto[i][6],
                    (desto[i][12].includes("*N")) ? "" : desto[i][0],
                    ((desto[i][19] != "") ? desto[i][19] : ""),
                    rearSmallTop,
                    rearSmallBottom,
                    desto[i][6],
                    mergedLines
                )
                terminus += outputHanoverDestoLine(
                    desto[i][3],
                    generateHanoverScroll(desto[i][1], desto[i][0], fixedDestoCode, 1, 1),
                    desto[i][4],
                    IBISOutput(2, version, desto[i]),
                    mergedLines,
                    "",
                    mergedLines,
                    (desto[i][12].includes("*N")) ? "" : desto[i][0],
                    ((desto[i][19] != "") ? desto[i][19] : ""),
                    rearSmallTop,
                    rearSmallBottom,
                    desto[i][6],
                    mergedLines
                )
            }
            else terminus += outputKrugerDestoLine(
                desto[i][3],
                i,
                desto[i][4],
                IBISOutput(1, version, desto[i]),
                splitParts[0] + desto[i][13],
                splitParts[1] + desto[i][14] + manageRouteNumber(desto[i], customFont),
                desto[i][6] + desto[i][12],
                IBISOutput(2, version, desto[i])
            )
        } else {
            let scrolling = 0;
            let current = 0;
            if (desto[i][8] !== "") {
                if (desto[i][9] !== ""
                    && !twoScreens) {
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
                var top = "";
                var bottom = "";
                if (hanover) {
                    if (current === 1 && twoScreens) {
                        top = desto[i][8]; // Top Line
                        bottom = desto[i][9]; // Bottom Line
                    } else if (flip) {
                        top = desto[i][7 + current]; // Top Line
                        bottom = desto[i][6]; // Bottom Line
                    } else {
                        top = desto[i][6]; // Top Line
                        bottom = desto[i][7 + current] + ((desto[i][13 + current].includes("*K")) ? "*0605N1E1" : ""); // Bottom Line
                    }

                    terminus += outputHanoverDestoLine(
                        desto[i][3],
                        generateHanoverScroll(desto[i][1], desto[i][0], fixedDestoCode, current, scrolling),
                        desto[i][4],
                        IBISOutput(2, version, desto[i]),
                        top,
                        bottom,
                        top,
                        (desto[i][12].includes("*N")) ? "" : desto[i][0],
                        ((desto[i][19] != "") ? desto[i][19] : ""),
                        rearSmallTop,
                        rearSmallBottom,
                        top,
                        bottom
                    );
                } else {
                    if (current === 1 && twoScreens) {
                        top = desto[i][8] + desto[i][14]; // Top Line
                        bottom = desto[i][9] + desto[i][15]; // Bottom Line
                    } else if (flip) {
                        top = desto[i][7 + current] + desto[i][13 + current]; // Top Line
                        bottom = desto[i][6] + desto[i][12]; // Bottom Line
                    } else {
                        top = desto[i][6] + desto[i][12]; // Top Line
                        bottom = desto[i][7 + current] + desto[i][13 + current]; // Bottom Line
                    }
                    terminus += outputKrugerDestoLine(
                        desto[i][3],
                        (current * 1000) + i,
                        desto[i][4],
                        IBISOutput(1, version, desto[i]),
                        top,
                        bottom + manageRouteNumber(desto[i], customFont),
                        "",
                        IBISOutput(2, version, desto[i])
                    )
                }
                current++;
            }
            // Prepay Only
            if (prepayScreen && !hanover) {
                terminus += outputKrugerDestoLine(
                    desto[i][3],
                    (current * 1000) + i,
                    desto[i][4],
                    IBISOutput(1, version, desto[i]),
                    "PREPAY ONLY*I",
                    manageRouteNumber(desto[i], customFont),
                    "",
                    IBISOutput(2, version, desto[i])
                )
            }
        }
        routes += (hanover) ? "" : generateInfoSystemTrips(desto[i], IBISDesto, i);
    }
    // Check for duplicate Desto Codes as probable with Hannover Mod and reset array.
    checkDuplicateDestoCodes(GlobalHannoverDestoCodes);
    GlobalHannoverDestoCodes = [];

    return [terminus, serviceTrip, routes];
}

function generateHeader(version,title,serviceTrip) {
    let output = "\tAutogenerated File made for QFA1213's Bounded Desto Controller Mod.\r\n"
    output += "This HOF is designed for " + version + " only.\r\n\r\n";
    output += "Generated: " +  Math.floor(Date.now() / 1000) + "\r\n\r\n";
    output += "[name]\r\n" + title + "\r\n\r\n";
    output += "[servicetrip]\r\n" + serviceTrip + "\r\n\r\n";
    output += "[global_strings]\r\n0\r\n\r\n";
    output += "stringcount_terminus\r\n26\r\n\r\n";
    output += "stringcount_busstop\r\n9\r\n\r\n";
    output += "[addterminus_list]\r\n";
    return output;
}

function generateInfoSystemTrips(routeRowArray, IBISDesto, i){
    let routes = "[infosystem_trip]\r\n"; //opening tag
    routes += IBISDesto + "\r\n"; //desto code
    routes += ((routeRowArray[0] == "") ? routeRowArray[5] : routeRowArray[5] + " " + routeRowArray[0]) + "\r\n"; // Name
    routes += i + "\r\n";
    routes += (routeRowArray[0]).replace(/\D/g, "");
    routes += "\r\n\r\n[infosystem_busstop_list]\r\n0\r\n\r\n";
    return routes;
}



//https://stackoverflow.com/a/9160869
String.prototype.insert = function(index, string) {
    if (index > 0) {
      return this.substring(0, index) + string + this.substr(index);
    }
  
    return string + this;
  };