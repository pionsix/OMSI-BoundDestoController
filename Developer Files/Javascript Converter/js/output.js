function generateDestoData(destos, version, hanover, customFont) {
    let terminus = "";
    let routes = "";
    let serviceTrip = "";
    let i = 0;
    let map = "";
    for (let code in destos) {
        for (let variant in destos[code]) {
            
            let display = destos[code][variant];

            // Getting Global Vars
            if (code == "0#") {
                map = display.name;
            }

            // If Code is null
            if (code == "null" || code == "0#") {
                continue;
            }
            
            // Skip if version doesn't match selection

            display["min"] = (display["min"] == null) ? 0 : display["min"];
            display["max"] = (display["max"] == null) ? 999 : display["max"];
            if (!(display["min"] <= version && display["max"] > version))
            {
                continue;
            }

            // Skip if destination not set
            if (display["destination"] == "null") {
                continue;
            }

            // if Incomplete
            if (display["name"] == null && display["textTop"] == null) {
                continue;
            }
            
            
        
            // Initial Set-up
            let prepayScreen = false;
            let twoScreens = false
            let flip = false
            let IBISDesto = "";
            let rearSmallTop = ""
            let rearSmallBottom = ""
    
            // Exclude Operators
            //
            // ----- To Add -----
            //           

            // fix Null
            display["destination"] = denullify(display["destination"]);
            display["formatTop"] = denullify(display["formatTop"]);
            display["textTop"] = denullify(display["textTop"]);
            display["route"] = denullify(display["route"]);
            display["prefix"] = denullify(display["prefix"]);
            display["name"] = denullify(display["name"]);
            display["img"] = denullify(display["img"]);

            // Update Booleans
            display["fixedCode"] = display["fixedCode"] || false;
            display["exit"] = display["exit"] || false;
            const split = display["formatTop"].includes("*IT") || false;
            const bound = display["formatTop"].includes("*N") || false;;

            const displayRoute = display["prefix"] + display["route"].toString();
            IBISDesto = code.padStart(4, "0").insert(3, "0");

            // Rear Display
            if (display["textRear"]) {
                const splitRear = display["textRear"].split('|');
                rearSmallTop = splitRear[0]
                rearSmallBottom = splitRear[1]
            }

            // Set Service Trip
            if (display["formatTop"].includes("%")) {
                serviceTrip = display["destination"];
                display["formatTop"] = display["formatTop"].replace("%", "")
            }

            

            // Check for special formatting
            if (display["formatTop"].includes("#")) {
                prepayScreen = true;
                display["formatTop"] = display["formatTop"].replace("#", "");
            }
    
            if (display["formatTop"].includes("^")) {
                flip = true;
                display["formatTop"] = display["formatTop"].replace("^", "");
            }
    
            if (display["formatBottom2"] != null && display["formatBottom2"].includes("!")) {
                twoScreens = true;
                display["formatBottom2"] = display["formatBottom2"].replace("!", "");
            }
            
    
            // Generate HOF displays
            if (split) {
                const splitParts = display["textBottom1"].split('|');
                // Converts Split Screen into two screens
                if (hanover) {
                    const mergedLines = splitParts[0] + " " + splitParts[1]
                    terminus += outputHanoverDestoLine(
                        display["exit"],
                        generateHanoverScroll(code, displayRoute, display["fixedCode"], 0, 1),
                        display["destination"],
                        IBISOutput(2, display["destination"], display["code"]),
                        display["textTop"],
                        "",
                        display["textTop"],
                        (display["formatTop"].includes("*N")) ? "" : displayRoute,
                        display["img"],
                        rearSmallTop,
                        rearSmallBottom,
                        display["textTop"],
                        mergedLines
                    )
                    terminus += outputHanoverDestoLine(
                        display["exit"],
                        generateHanoverScroll(code, displayRoute, display["fixedCode"], 1, 1),
                        display["destination"],
                        IBISOutput(2, display["destination"], display["code"]),
                        mergedLines,
                        "",
                        mergedLines,
                        (display["formatTop"].includes("*N")) ? "" : displayRoute,
                        display["img"],
                        rearSmallTop,
                        rearSmallBottom,
                        display["textTop"],
                        mergedLines
                    )
                }
                else terminus += outputKrugerDestoLine(
                    display["exit"],
                    i,
                    display["destination"],
                    IBISOutput(1, display["destination"], display["code"]),
                    splitParts[0] + denullify(display["formatBottom1"]),
                    splitParts[1] + denullify(display["formatBottom2"]) + manageRouteNumber(displayRoute, bound, customFont),
                    display["textTop"] + display["formatTop"],
                    IBISOutput(2, display["destination"], display["code"])
                )
            } else {
                let scrolling = 0;
                let current = 0;
                if (display["textBottom2"] != null) {
                    if (display["textBottom3"] != null
                        && !twoScreens) {
                        if (display["textBottom3"] != null) {
                            scrolling = 3;
                        } else if (display["textBottom4"] != null) {
                            scrolling = 4;
                        } else
                            scrolling = 2;
                    } else
                        scrolling = 1;
                }
                while (current <= scrolling) {
                    var top = "";
                    var bottom = "";                  

                    const textTop = (hanover) ? display["textTop"] : display["textTop"] + display["formatTop"];
                    const textBottom = [
                        (hanover) ? denullify(display["textBottom1"]) : denullify(display["textBottom1"]) + denullify(display["formatBottom1"]),
                        (hanover) ? denullify(display["textBottom2"]) : denullify(display["textBottom2"]) + denullify(display["formatBottom2"]),
                        (hanover) ? denullify(display["textBottom3"]) : denullify(display["textBottom3"]) + denullify(display["formatBottom3"]),
                        (hanover) ? denullify(display["textBottom4"]) : denullify(display["textBottom4"]) + denullify(display["formatBottom4"]),
                        (hanover) ? denullify(display["textBottom5"]) : denullify(display["textBottom5"]) + denullify(display["formatBottom5"]),
                    ];

                    if (current === 1 && twoScreens) {
                        top = textBottom[1]; // Top Line
                        bottom = textBottom[2]; // Bottom Line
                    } else if (flip) {
                        top = textBottom[current]; // Top Line
                        bottom = textTop; // Bottom Line
                    } else {
                        top = textTop; // Top Line
                        bottom = textBottom[current]; // Bottom Line
                    }

                    if (hanover) {
                        // Force Small Text
                        top += (top.includes("*K") ? "*0605N1E1" : "");
                        bottom += (bottom.includes("*K") ? "*0605N1E1" : "");

                        terminus += outputHanoverDestoLine(
                            display["exit"],
                            generateHanoverScroll(code, displayRoute, display["fixedCode"], current, scrolling),
                            display["destination"],
                            IBISOutput(2, display["destination"], display["code"]),
                            top,
                            bottom,
                            top,
                            (display["formatTop"].includes("*N")) ? "" : displayRoute,
                            display["img"],
                            rearSmallTop,
                            rearSmallBottom,
                            top,
                            bottom
                        );
                    } else {
                        terminus += outputKrugerDestoLine(
                            display["exit"],
                            (current * 1000) + i,
                            display["destination"],
                            IBISOutput(1, display["destination"], display["code"]),
                            top,
                            bottom + manageRouteNumber(displayRoute, bound, customFont),
                            "",
                            IBISOutput(2, display["destination"], display["code"])
                        )
                    }
                    current++;
                }
                // Prepay Only
                if (prepayScreen && !hanover) {
                    terminus += outputKrugerDestoLine(
                        display["exit"],
                        (current * 1000) + i,
                        display["destination"],
                        IBISOutput(1, display["destination"], display["code"]),
                        "PREPAY ONLY*I",
                        manageRouteNumber(displayRoute, bound, customFont),
                        "",
                        IBISOutput(2, display["destination"], display["code"])
                    )
                }
            }
            routes += (hanover) ? "" : generateInfoSystemTrips(IBISDesto, i, displayRoute, display["name"]);

            i++;
        }
    }
    // Check for duplicate Desto Codes as probable with Hannover Mod and reset array.
    checkDuplicateDestoCodes(GlobalHannoverDestoCodes);
    GlobalHannoverDestoCodes = [];
    return [terminus, serviceTrip, routes, map];
}