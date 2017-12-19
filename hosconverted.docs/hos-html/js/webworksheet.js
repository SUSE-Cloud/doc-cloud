var copyright = "Property of Expitas LLC. All rights reserved. ",
    xlValidAlertStop = 1,
    xlValidAlertWarning = 2,
    xlValidAlertInformation = 3,
    xlInputOnly = 0,
    xlValidateWholeNumber = 1,
    xlValidateDecimal = 2,
    xlValidateList = 3,
    xlValidateDate = 4,
    xlValidateTime = 5,
    xlValidateTextLength = 6,
    xlValidateCustom = 7,
    xlBetween = 1,
    xlNotBetween = 2,
    xlEqual = 3,
    xlNotEqual = 4,
    xlGreater = 5,
    xlLess = 6,
    xlGreaterEqual = 7,
    xlLessEqual = 8,
    vOps = [];
vOps[xlEqual] = "==";
vOps[xlNotEqual] = "!=";
vOps[xlGreater] = ">";
vOps[xlLess] = "<";
vOps[xlGreaterEqual] = ">=";
vOps[xlLessEqual] = "<=";
var xlErrDiv0 = "#DIV/0!",
    xlErrNA = "#N/A",
    xlErrName = "#NAME?",
    xlErrNull = "#NULL!",
    xlErrNum = "#NUM!",
    xlErrRef = "#REF!",
    xlErrValue = "#VALUE!",
    xlErrFunction = "#FUNCTION!",
    xlError = "#ERROR",
    showParse = !1,
    gmtOffset = 6E4 * (new Date).getTimezoneOffset(),
    msecPerDay = 864E5,
    msec00to70 = Math.abs(Date.UTC(1900, 1, 1)),
    Jan011970 = 216E5,
    currentCell = "",
    currentClass = "",
    browser = detectBrowser(),
    inputTags = "",
    objectTags = "",
    categories = [],
    dependents = [],
    statusDivId = "";

function wwsCompare(a, b) {
    if (isNumber(a) && isNumber(b) && a < Jan011970 && b < Jan011970) return ROUND(a, 7) == ROUND(b, 7) ? "" : "Error";
    if (parseInt(a) >= Jan011970 && parseInt(b) >= Jan011970) {
        var c = new Date(b);
        return (new Date(a)).toUTCString() == c.toUTCString() ? "" : "Error"
    }
    return a.toString().toUpperCase() == b.toString().toUpperCase() ? "" : "Error"
}

function wwsDateDiff(a, b) {
    return a - b
}

function wwsDateMath(a, b) {
    return a + b
}

function wwsGetUrlData(a) {
    var b = document.location.href,
        c = b.substring(b.lastIndexOf("=") + 1),
        b = b.replace(/\?d=\w*/, ""),
        b = b.substring(b.lastIndexOf("/") + 1);
    return rc4Decrypt(b, c).split("|")[a - 1]
}

function wwsGoTo(a, b) {
    var c = "";
    if (b) {
        for (var d = a.replace(/(\w)*[\/]/g, ""), d = rc4Encrypt(d, b), e = 0; e < d.length; e++) var g = "0" + d.charCodeAt(e).toString(16),
            c = c + g.substr(g.length - 2);
        document.location = a + "?d=" + c
    } else document.location = a
}

function wwsHideRows(a, b, c) {
    1 == arguments.length && (b = a);
    2 == arguments.length && (c = 1);
    for (var d = a; d <= b; d += c) {
        var e = document.getElementById("ROW" + d.toString());
        if (e) {
            e.style.display = "none";
            for (var e = e.getElementsByTagName("*"), g = 0; g < e.length; g++) e[g].style.display = "none"
        }
    }
    positionDatePickers()
}

function wwsInit() {
    if (protectPage) {
        if ("boolean" == typeof protectPage) return document.getElementById("mainBody").style.display = "none", document.getElementById("unProtect").style.display = "", document.getElementById("iProtect").focus(), !0;
        unProtectPage(copyright)
    }
    inputTags || (inputTags = getElementsByTagNames("input,textarea"));
    for (var a = 0; a < inputTags.length; a++) {
        var b = inputTags[a].id.substr(1);
        if (null != document.getElementById(b) && "file" != inputTags[a].type) {
            var c = inputTags[a].getAttribute("data-default");
            "checkbox" == inputTags[a].type && !1 == inputTags[a].checked && (c = "");
            var d = document.getElementById(b).getAttribute("category"),
                e = document.getElementById(b).getAttribute("format");
            if ("" != c) {
                var g = parseFormula(c);
                try {
                    c = eval(g)
                } catch (f) {
                    c = g
                }
            }
            switch (d) {
                case "currency":
                    c = parseFloat(c);
                    if (0 != c || displayZeroes) inputTags[a].value = formatCurrency(c, e, b);
                    document.getElementById(b).setAttribute("data-cval", c);
                    break;
                case "date":
                    c = isDate(c);
                    null == c && (c = "");
                    inputTags[a].value = formatDate(c, e);
                    document.getElementById(b).setAttribute("data-cval",
                        c);
                    break;
                case "number":
                    "" != c && (inputTags[a].value = formatNumber(c, e));
                    document.getElementById(b).setAttribute("data-cval", c);
                    break;
                case "percentage":
                    c = c.toString().replace(/\%/, "");
                    "" != c && (inputTags[a].value = formatNumber(c, e) + "%");
                    document.getElementById(b).setAttribute("data-cval", c / 100);
                    break;
                case "special":
                    "" != c && (inputTags[a].value = formatSpecial(c, e));
                    document.getElementById(b).setAttribute("data-cval", c);
                    break;
                default:
                    inputTags[a].value = c, document.getElementById(b).setAttribute("data-cval", c)
            }
        }
    }
    d =
        document.getElementsByTagName("select");
    for (a = 0; a < d.length; a++) {
        c = d[a].getAttribute("data-default");
        d[a].options[0] && !c && (c = d[a].options[0].value);
        b = d[a].id.substr(1);
        try {
            document.getElementById(b).getAttribute("category"), document.getElementById(b).setAttribute("data-cval", c)
        } catch (h) {}
        if ("" != c)
            for (b = 0; b < d[a].options.length; b++) d[a].options[b].value == c && (d[a].options[b].selected = !0)
    }
    0 < webQueries.length && setupWebQueries();
    calculateOnInit && (calculate("ONCE"), applyAllConditionalFormats());
    positionDatePickers();
    "" != tabOrder ? setTabOrder(tabOrder) : "" != firstInput && "checkbox" != document.getElementById(firstInput).className && hilite(firstInput)
}

function wwsSetCell(a, b) {
    var c = document.getElementById(a);
    if (!c) return !1;
    var d = getCategory(a, c),
        e = c.getAttribute("format"),
        g = "",
        f = "",
        h = "i" + a;
    switch (d) {
        case "currency":
            g = isNumber(b) ? formatCurrency(b, e, a) : b;
            f = b;
            break;
        case "date":
            g = isDate(b);
            g = null != g ? formatDate(g, e) : b;
            cvalue = b;
            break;
        case "percentage":
            g = formatNumber(100 * b, e) + "%";
            f = b;
            break;
        case "number":
            try {
                var k = excel(b)
            } catch (n) {
                k = b
            }
            "Infinity" == k && (k = 0);
            f = k;
            g = 0 == k && !displayZeroes ? " " : formatNumber(k, e);
            break;
        case "special":
            g = formatSpecial(b, e);
            f = b;
            break;
        default:
            g = b.toString(), f = b
    }
    if (e = document.getElementById(h))
        if (g = e.tagName.toLowerCase(), "select" == g)
            for (c = 0; c < e.options.length; c++) {
                if (e.options[c].value.toLowerCase() == b.toLowerCase()) {
                    e.options[c].selected = !0;
                    break
                }
            } else "input" == g && (e.value = b, c.setAttribute("data-cval", f));
        else c.innerHTML = g, c.setAttribute("data-cval", f)
}

function wwsShowAndHide(a, b, c, d, e) {
    wwsShowRows(a, b, 1);
    wwsHideRows(c, d, 1);
    if (a = document.getElementById("i" + e)) {
        try {
            a.focus(), a.select()
        } catch (g) {}
        return !0
    }
    if (e) try {
        document.getElementById(e).scrollIntoView(!0)
    } catch (f) {}
}

function wwsShowRows(a, b, c) {
    1 == arguments.length && (b = a);
    2 == arguments.length && (c = 1);
    for (var d = a; d <= b; d += c) {
        var e = document.getElementById("ROW" + d.toString());
        if (e) {
            e.style.display = "";
            for (var e = e.getElementsByTagName("*"), g = 0; g < e.length; g++) e[g].style.display = ""
        }
    }
    positionDatePickers()
}

function wwsToggle(a, b, c, d, e) {
    c || (c = b);
    "" == document.getElementById("ROW" + b.toString()).style.display ? (wwsHideRows(b, c, 1), e && (a.innerHTML = e)) : (wwsShowRows(b, c, 1), d && (a.innerHTML = d));
    return !0
}

function wwsVisible(a) {
    return "" == document.getElementById("ROW" + a.toString()).style.display ? !0 : !1
}

function wwsUserClicked(a) {
    return a.replace(/ /g, "").toLowerCase() == lastBtnClick.replace(/ /g, "").toLowerCase() ? !0 : !1
}

function applyAllConditionalFormatsOld() {
    for (var a = 0; a < objectTags.length; a++) "c" == objectTags[a].id.substring(0, 1) && applyConditionalFormats(objectTags[a].id.substr(1))
}

function applyAllConditionalFormats() {
    for (var a = 0; a < objectTags.length; a++)
        if ("c" == objectTags[a].id.substring(0, 1)) {
            var b = objectTags[a].getAttribute("formula"),
                b = parseFormula(b);
            try {
                result = eval(b)
            } catch (c) {}
        }
}

function applyConditionalFormats(a) {
    if (a = document.getElementById("x" + a)) {
        a = a.getAttribute("dependents").split(",");
        for (var b = 0; b < a.length - 1; b++) {
            var c = document.getElementById("c" + a[b]).getAttribute("formula"),
                c = parseFormula(c);
            try {
                result = eval(c)
            } catch (d) {}
        }
    }
}

function buildSelectOptions(a, b, c) {
    var d = c.split(":")[0],
        e = c.split(":")[1];
    c = ROW(d);
    d = COLUMN(d);
    ROW(e);
    e = COLUMN(e);
    e = getColumnLetter(d) + c + ":" + getColumnLetter(e) + c;
    a = document.getElementById(a);
    a.options.length = 0;
    b = MATCH(getCellValue(b), e, 0);
    if (b != xlErrNA)
        for (e = 0; 100 > e; e++) {
            var g = getColumnLetter(d + b - 1),
                g = getCellValue(g + ++c);
            if ("" == g) break;
            a.options[a.options.length] = new Option(g, g)
        }
}

function calculate(a) {
    var b, c, d, e, g, f;
    if (!getInput(a)) return document.getElementById("i" + a).value = "", !1;
    if (manualCalculation && "ALL" != a && "ONCE" != a) return !0;
    try {
        f = getDependents(a).split(",")
    } catch (h) {
        if ("ALL" == a || "ONCE" == a) {
            objectTags || (objectTags = document.getElementsByTagName("object"));
            b = [];
            for (f = 0; f < objectTags.length; f++) "f" == objectTags[f].id.substring(0, 1) && b.push(objectTags[f].id.substr(1));
            f = b
        } else return applyConditionalFormats(a), !0
    }
    var k = !1;
    c = "";
    statusMessageDisplay("Calculating...");
    for (var n =
            0; n < iterations; n++) {
        n == iterations - 1 && (k = !0);
        for (var j = 0; j < f.length; j++)
            if (b = f[j], g = document.getElementById("f" + b)) {
                c = g.getAttribute("formula");
                g = document.getElementById(b);
                var p = g.getAttribute("format"),
                    l = getCategory(b, g);
                c = parseFormula(c);
                try {
                    d = eval(c), void 0 == d && (d = "")
                } catch (q) {
                    d = "!ERROR"
                }
                switch (l) {
                    case "number":
                        try {
                            e = excel(d)
                        } catch (m) {
                            e = d
                        }
                        "Infinity" == e && (e = 0);
                        g.setAttribute("data-cval", e);
                        c = 0 == e && !displayZeroes ? " " : formatNumber(e, p);
                        d = e;
                        break;
                    case "currency":
                        c = formatCurrency(d, p, b);
                        break;
                    case "date":
                        c =
                            formatDate(d, p);
                        break;
                    case "percentage":
                        c = formatNumber(100 * d, p) + "%";
                        break;
                    case "fraction":
                        c = formatFraction(d, p);
                        break;
                    case "special":
                        c = formatSpecial(d, p);
                        break;
                    default:
                        isNumber(d) && (d = parseFloat(d)), c = d.toString()
                }
                g.setAttribute("data-cval", d);
                k && (g.innerHTML = c, applyConditionalFormats(b))
            }
    }
    applyConditionalFormats(a);
    statusMessageDisplay();
    return !0
}

function checkFileType(a, b) {
    var c = a.substr(a.lastIndexOf(".") + 1);
    return 0 > b.indexOf(c) ? (alert("Warning: Files of type ." + c + " are not expected for this attachment.\rThe expected types are " + b + "."), !1) : !0
}

function clearForm() {
    window.location.reload(true);
    return !0
}

function crlf() {
    var a = String.fromCharCode(10);
    crlf.arguments.length = 1;
    for (var b = 0; b < crlf.arguments[0] - 1; b++) a += String.fromCharCode(10);
    return a
}

function D2(a) {
    return (0 > a || 9 < a ? "" : "0") + a
}

function DQ(a) {
    return '"' + a + '"'
}

function detectBrowser() {
    return -1 != navigator.userAgent.indexOf("MSIE") ? "MSIE" : -1 != navigator.userAgent.indexOf("Firefox") ? "Firefox" : -1 != navigator.userAgent.indexOf("Chrome") ? "Chrome" : "Other"
}

function statusMessageDisplay(a) {
    var b = document.getElementById("UserMessage");
    null == a ? (clearInterval(statusDivId), window.status = "", b.style.display = "none") : statusDivId = setInterval(function() {
        window.status = a;
        b.innerHTML = a;
        b.style.display = ""
    }, 10)
}

function doCheckbox(a) {
    for (var b = document.getElementById(a).getAttribute("group"), c = document.getElementById(a).checked, d = 0; d < inputTags.length; d++)
        if ("checkbox" == inputTags[d].type && null != b && inputTags[d].getAttribute("group") == b) {
            var e = inputTags[d].id.substr(1);
            inputTags[d].checked = !1;
            inputTags[d].value = "";
            inputTags[d].setAttribute("data-cval", "");
            calculate(e)
        }
    e = a.substr(1);
    c ? (document.getElementById(a).checked = !0, document.getElementById(a).value = document.getElementById(a).getAttribute("data-default")) :
        (document.getElementById(a).value = "", document.getElementById(a).setAttribute("data-cval", ""));
    calculate(e);
    document.getElementById(a).focus();
    return !0
}

function enterKeyIsTab(a) {
    if ("MSIE" == browser && 13 == a.keyCode) return a.keyCode = 9;
    if (13 == a.which)
        for (var b = !1, c = document.getElementsByTagName("*"), d = 0; d < c.length; d++) {
            var e = c[d].nodeName;
            if ("INPUT" == e || "TEXTAREA" == e || "SELECT" == e)
                if (e = c[d].getAttribute("type"), "hidden" != e && "button" != e && c[d].id == a.target.id) b = !0;
                else if (b) return document.getElementById(c[d].id).focus(), !1
        }
}

function excel(a) {
    return a.toFixed(9).replace(/\.0*$/, "") * 1
}

function excelToUnixDate(a) {
    return (a - 25568) * msecPerDay
}

function expandRange(a) {
    var b = [],
        c = [];
    if (isRange(a)) {
        var b = a.split(":"),
            d = ROW(b[0]);
        a = ROW(b[1]);
        for (var e = COLUMN(b[0]), b = COLUMN(b[1]); d <= a; d++)
            for (var g = e; g <= b; g++) {
                var f = getColumnLetter(g) + d.toString();
                document.getElementById(f) && c.push(f)
            }
    } else document.getElementById(a) && c.push(a);
    return c.toString()
}

function findPos(a) {
    var b = curtop = 0;
    if (a.offsetParent) {
        do b += a.offsetLeft, curtop += a.offsetTop; while (a = a.offsetParent)
    }
    return [b, curtop]
}

function formatCurrency(a, b, c) {
    var d = "$",
        e = "",
        g = [],
        f = 2;
    g[1] = null;
    if (isNaN(parseFloat(a))) return " ";
    0 > a && (0 < b.search(/\_\)/) ? (d = "($", e = ")") : d = "-$", g = b.match(/;\[(\w*)\]/));
    b = b.match(/0\.0+/);
    f = null == b ? 0 : b[0].split(".")[1].length;
    null != g && (document.getElementById(c).style.color = g[1]);
    return d + number_format(Math.abs(a).toFixed(f).toString(), f) + e
}

function formatDate(a, b) {
    if (null == a || "" == a || 0 > a) return "";
    if (!isNumber(a)) return a;
    var c = "JANUARY FEBRUARY MARCH APRIL MAY JUNE JULY AUGUST SEPTEMBER OCTOBER NOVEMBER DECEMBER".split(" "),
        d = "SUNDAY MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY".split(" "),
        e = INT(a) != a ? new Date(excelToUnixDate(a - 0.0416667 * (24 - gmtOffset / 36E5))) : new Date(excelToUnixDate(a)),
        g = e.getFullYear() + "",
        f = e.getMonth() + 1,
        h = e.getDate(),
        k = e.getDay(),
        n = e.getHours(),
        j = e.getMinutes(),
        e = e.getSeconds(),
        n = 0 < b.indexOf("PM") ? n % 12 : n;
    0 ==
        n && (n = 12);
    b = b.replace("h:mm", "h:nn");
    b = b.replace("h:m", "h:n");
    b = b.replace("mm:s", "nn:s");
    b = b.replace("m:s", "n:s");
    b = b.replace("mmmmm", c[f - 1].substr(0, 1));
    b = b.replace("mmmm", c[f - 1]);
    b = b.replace("mmm", c[f - 1].substr(0, 3));
    b = b.replace("mm", D2(f));
    b = b.replace("m", f);
    b = b.replace("dddd", d[k]);
    b = b.replace("ddd", d[k].substr(0, 3));
    b = b.replace("dd", D2(h));
    b = b.replace("d", h);
    b = b.replace("yyyy", g);
    b = b.replace("yy", g.substr(2, 2));
    b = b.replace("hh", D2(n));
    b = b.replace("h", n);
    b = b.replace("nn", D2(j));
    b = b.replace("n",
        j);
    b = b.replace("ss", D2(e));
    b = b.replace("s", e);
    b = titleCase(b.toLowerCase());
    return b = 12 <= HOUR(a) ? b.replace(/[aA]m?\/[pP]m?/, "PM") : b.replace(/[aA]m?\/[pP]m?/, "AM")
}

function formatFraction(a, b) {
    var c = 1,
        d = 1,
        e = 1,
        g = 1,
        f = "";
    if (0 == a) return 0;
    if (parseFloat(a) == parseInt(a) && !isNaN(a)) return a;
    0 > a && (f = "- ", a = Math.abs(a));
    if (0 == a % 0.03125) {
        c = Math.floor(a);
        d = (a - c) / 0.03125;
        for (e = 32; ISEVEN(d);) d /= 2, e /= 2;
        0 < c && (d = c + " " + d);
        return f + d + "/" + e
    }
    for (; ROUND(c, 2) != ROUND(a, 2) && !(c < a ? d += 1 : (e += 1, d = parseInt(a * e)), c = d / e, 1E3 == ++g););
    if (d < e) return d + "/" + e;
    c = Math.floor(d / e);
    d = formatFraction(a - c, b);
    return f + c + " " + d
}

function formatNumber(a, b) {
    if (isNaN(parseFloat(a))) return 0;
    var c = b.match(/\.(0*)/mg);
    return number_format(a, null == c ? 0 : c[0].toString().length - 1)
}

function formatSpecial(a, b) {
    var c = a.toString(),
        d = /0{5}$/;
    if (d.test(b)) return 4 < c.length ? c : RIGHT("00000" + c, 5);
    d = /0{5}\-0{4}$/;
    if (d.test(b)) return d = c.replace(/-/g, ""), 9 > c.length && (d = RIGHT("000000000" + d, 9)), d.substr(0, 5) + "-" + d.substr(5, 4);
    d = /-#{4}$/;
    if (d.test(b)) {
        var e = c.replace(/[\(\)\-]/g, ""),
            c = RIGHT("0000" + e, 4);
        if (5 > e.length) return c;
        if (8 > e.length) return e = e.substring(0, e.length - 4), e + "-" + c;
        d = e.substring(0, e.length - 7);
        e = e.substr(d.length, 3);
        return "(" + d + ") " + e + "-" + c
    }
    return a
}

function getCategory(a, b) {
    null == categories[a] && (categories[a] = b.getAttribute("category"));
    return categories[a]
}

function getCellValue(a) {
    a = document.getElementById(a);
    var b = a.getAttribute("data-cval");
    null == b && (b = a.value, void 0 == b && (b = a.childNodes[0], null != b ? "#text" == b.nodeName ? (b = a.innerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"), b = b.replace(/\s*<a [^<>]*>/gi, "").replace(/<\/a>/gi, "")) : b = "A" == b.nodeName ? b.innerHTML.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") : b.value : b = a.innerHTML));
    a = parseFloat(b);
    return a == b ? a : b
}

function getColumnLetter(a) {
    return 27 > a ? String.fromCharCode(a + 64) : String.fromCharCode(parseInt((a - 1) / 26) + 64) + String.fromCharCode((a - 1) % 26 + 65)
}

function getDependents(a) {
    if (null == dependents[a]) {
        for (var b = "", c = "", d = document.getElementById("d" + a).getAttribute("dependents").split(","), e = 0; e < d.length; e++) b = isRange(d[e]) ? expandRange(d[e]) : d[e], "" != c && (c += ","), c += b;
        dependents[a] = c
    }
    return dependents[a]
}

function getElementsByTagNames(a) {
    a = a.split(",");
    for (var b = [], c = 0; c < a.length; c++)
        for (var d = document.getElementsByTagName(a[c]), e = 0; e < d.length; e++) b.push(d[e]);
    return b
}

function getInput(a) {
    var b = "i" + a;
    if (null != document.getElementById(b)) {
        var c = document.getElementById(a).getAttribute("category"),
            d = document.getElementById(a).getAttribute("format"),
            e = document.getElementById(a).getAttribute("validation"),
            g = document.getElementById(b).type.toUpperCase(),
            f = document.getElementById(b).value,
            f = f.replace(/(^ +)|( +$)/g, ""),
            f = f.replace(/<script|<a/g, "");
        switch (c) {
            case "number":
                f = f.replace(/[\$\,\%\ ]/g, "");
                "select" != document.getElementById(b).tagName.toLowerCase() && "" != f &&
                    (document.getElementById(b).value = formatNumber(f, d));
                "" == f && (f = 0);
                document.getElementById(a).setAttribute("data-cval", f);
                break;
            case "percentage":
                g = /\%/.test(f);
                f = f.replace(/\%/g, "");
                "select" != document.getElementById(b).tagName.toLowerCase() && (1 > f && (-1 < f && !g) && (f *= 100), document.getElementById(b).value = formatNumber(f, d) + "%", f /= 100);
                document.getElementById(a).setAttribute("data-cval", f);
                break;
            case "fraction":
                f = f.replace(/ /, "+");
                b = /^-/;
                d = !1;
                b.test(f) && (d = !0, f = f.replace(b, ""));
                try {
                    f = eval(f), void 0 == f &&
                        (f = "")
                } catch (h) {}
                d && (f = "-" + f);
                document.getElementById(a).setAttribute("data-cval", f);
                break;
            case "currency":
                f = f.replace(/[\$\,]/g, "");
                "select" != document.getElementById(b).tagName.toLowerCase() && (document.getElementById(b).value = formatCurrency(f, d, b));
                document.getElementById(a).setAttribute("data-cval", f);
                break;
            case "date":
                c = isDate(f);
                if (null == c)
                    if (c = isTime(f), null == c) {
                        document.getElementById(b).value = f;
                        document.getElementById(a).setAttribute("data-cval", f);
                        break
                    } else f = new Date(c), c = unixToExcelDate(c -
                        gmtOffset) + f.getHours() / 24 + f.getMinutes() / 1440 + (f.getSeconds() + 1) / 86400;
                document.getElementById(a).setAttribute("data-cval", c);
                "SELECT-ONE" != g && (document.getElementById(b).value = formatDate(c, d));
                f = c;
                break;
            default:
                document.getElementById(b).value = f, document.getElementById(a).setAttribute("data-cval", f)
        }
        if (null != e && "" != f && !validate(document.getElementById(e), f)) return !1
    }
    return !0
}

function getRangeValues(a) {
    var b = [],
        c = [],
        c = expandRange(a).split(",");
    for (a = 0; a < c.length; a++) b.push(getCellValue(c[a]));
    return b
}

function getStyle(a, b) {
    if (!a) return !0;
    if (a.currentStyle) {
        var c = b.replace(/\-(.)/g, function(a, b) {
            return b.toUpperCase()
        });
        return a.currentStyle[c]
    }
    if (window.getComputedStyle) {
        var c = window.getComputedStyle(a, "").getPropertyValue(b),
            d = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
        return d ? "#" + (16777216 | d[1] << 16 | d[2] << 8 | d[3]).toString(16).substr(1) : c
    }
}

function getStyleById(a, b) {
    var c = document.getElementById(a);
    return !c ? !0 : getStyle(c, b)
}

function hideDatePicker(a) {
    a = document.getElementById(a + "_calendar");
    a.parentNode.removeChild(a);
    return !0
}

function hilite(a) {
    var b = a.substr(1);
    unHilite();
    if (!document.getElementById(b)) return !1;
    currentCell = a;
    currentClass = document.getElementById(a).getAttribute("class") || document.getElementById(a).getAttribute("className");
    try {
        if ("checkbox" == document.getElementById(a).className.toLowerCase() || "select" == document.getElementById(a).tagName.toLowerCase()) return !1
    } catch (c) {}
    try {
        document.getElementById(a).style.border = activeBorder, document.getElementById(a).style.backgroundColor = activeBackground, document.getElementById(a).focus(),
            document.getElementById(a).select()
    } catch (d) {}
    var e = document.getElementById(b).getAttribute("validation");
    if (null != e) {
        b = document.getElementById(e).getAttribute("valTitle");
        e = document.getElementById(e).getAttribute("valMessage");
        if (null == b && null == e || "" == e) return !0;
        var g = document.getElementById("InputMessage"),
            f = findPos(document.getElementById(a));
        g.style.left = f[0] + Math.round(parseFloat(getStyleById(a, "width")) / 2) + "px";
        g.style.top = f[1] + (parseFloat(getStyleById(a, "height")) + 6) + "px";
        f = "";
        "" != b && (f += "<b>" +
            b + "</b><br>");
        null != e && (f += e);
        g.innerHTML = f;
        g.style.display = ""
    } - 1 < datePickerAuto.indexOf(a) && (new Epoch(a, "popup", document.getElementById(a))).show();
    return !0
}

function isDate(a) {
    if ("" == a.toString()) return null;
    var b = /^(\d{1,2})([\/-])(\d{1,2})([\/-])?(\d{2}|\d{4})?$/,
        b = a.toString().match(b);
    if (null != b) {
        a = parseInt(b[1], 10);
        var c = parseInt(b[3], 10),
            b = parseInt(b[5], 10)
    } else if (b = /^([A-Za-z]{3,9})([- ])(\d{1,2})([- ,])*(\d{2}|\d{4})?$/, b = a.toString().match(b), null != b) a = (new Date("1 " + b[1] + " 2011")).getMonth() + 1, c = parseInt(b[3], 10), b = parseInt(b[5], 10);
    else if (b = /^(\d{1,2})([- ])([A-Za-z]{3,9})([- ,])*(\d{2}|\d{4})?$/, b = a.toString().match(b), null != b) c = parseInt(b[1],
        10), a = (new Date("1 " + b[3] + " 2011")).getMonth() + 1, b = parseInt(b[5], 10);
    else return isNumber(a) ? a : null;
    isNaN(b) && (b = (new Date).getFullYear());
    30 > b && (b += 2E3);
    100 > b && (b += 1900);
    return isNaN(a) || (1 > a || 12 < a) || (1 > c || 31 < c) || (4 == a || 6 == a || 9 == a || 11 == a) && 31 == c || 2 == a && (29 < c || 29 == c && !(0 == b % 4 && (0 != b % 100 || 0 == b % 400))) ? null : unixToExcelDate(Date.parse(a + "/" + c + "/" + b))
}

function isNumber(a) {
    return parseFloat(a) == a ? !0 : !1
}

function isRange(a) {
    return /[A-Z]{1,2}[0-9]{1,4}:[A-Z]{1,2}[0-9]{1,4}/.test(a)
}

function isTime(a) {
    var b = a.match(/^(\d{1,2}):(\d{2})[:]?(\d{2})?\s?([A|P])?/i);
    if (null == b) return null;
    a = parseInt(b[1], 10);
    var c = parseInt(b[2], 10),
        d = "" == b[3] || null == b[3] ? 0 : parseInt(b[3], 10),
        b = "" == b[4] || null == b[4] ? "A" : b[4];
    12 == a && "A" == b.toUpperCase() && (a = 0);
    12 > a && "P" == b.toUpperCase() && (a += 12);
    b = new Date;
    b.setHours(a, c, d);
    return Date.parse(b)
}

function nextFocusArea(a) {
    for (var b = !1, c = document.getElementsByTagName("*"), d = 0; d < c.length; d++) {
        var e = c[d].nodeName;
        if ("INPUT" == e || "TEXTAREA" == e || "SELECT" == e)
            if (e = c[d].getAttribute("type"), "hidden" != e && "button" != e && c[d].id == a) b = !0;
            else if (b) return c[d].id
    }
}

function number_format(a, b, c, d) {
    a = !isFinite(+a) ? 0 : +a;
    b = !isFinite(+b) ? 0 : Math.abs(b);
    d = "undefined" === typeof d ? "," : d;
    c = "undefined" === typeof c ? "." : c;
    var e = "",
        e = function(a, b) {
            var c = Math.pow(10, b);
            return "" + Math.round(a * c) / c
        },
        e = (b ? e(a, b) : "" + Math.round(a)).split(".");
    3 < e[0].length && (e[0] = e[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, d));
    if ((e[1] || "").length < b) e[1] = e[1] || "", e[1] += Array(b - e[1].length + 1).join("0");
    return e.join(c)
}

function onClickEvents(a) {
    lastBtnClick = a;
    calculate("ALL");
    lastBtnClick = ""
}

function parseFormula(a) {
    var b = [],
        c = 0;
    if (null == a) return "";
    "#" == a.substring(0, 1) && (a = SQRT1_2(a.substr(1)));
    a = a.replace(/^=/, "");
    var d = a.match(/("[^"]*")/g);
    if (null != d)
        for (var e = 0; e < d.length; e++) a = a.replace(d[e], e + "str"), b[e] = d[e];
    a = a.replace(/\$/, "");
    d = a.match(/(\b[A-Z]{1,2}[0-9]+)/g);
    if (null != d)
        for (e = 0; e < d.length; e++) {
            var g = document.getElementById(d[e]);
            if (null != g) {
                var f = getCellValue(d[e], g);
                switch (getCategory(d[e], g)) {
                    case "number":
                        isNaN(parseFloat(f)) && (f = 0);
                        break;
                    case "date":
                        "" == f && (f = 0);
                        c++;
                        break;
                    case "percentage":
                        isNaN(parseFloat(f)) && (f = 0);
                        break;
                    case "currency":
                        isNaN(parseFloat(f)) && (f = 0);
                        break;
                    case "general":
                        if (!isNumber(f)) try {
                            f = f.replace(/\\/g, "\\\\"), f = "'" + f.replace(/\'/g, "\\'") + "'"
                        } catch (h) {}
                }
            } else f = 0;
            a = a.replace(d[e], f)
        } - 1 < a.lastIndexOf("TODAY()") && (a = a.replace(/TODAY\(\)/, TODAY())); - 1 < a.lastIndexOf("NOW()") && (a = a.replace(/NOW\(\)/, NOW()));
    if (0 < b.length && (d = a.match(/(\d+str)/g), null != d))
        for (e = 0; e < d.length; e++) a = a.replace(d[e], b[e].replace(/\\/g, "\\\\"));
    return a
}

function positionDatePickers() {
    var a, b, c;
    if ("" != datePickerImg)
        for (var d = datePickerImg.split(","), e = 0; e < d.length; e++) {
            a = d[e];
            c = findPos(document.getElementById(a));
            b = document.getElementById("c" + a);
            try {
                b.style.left = c[0] + Math.round(parseFloat(getStyleById(a, "width")) + 5) + "px", b.style.top = c[1] + 1 + "px"
            } catch (g) {}
        }
}

function popupImg(a) {
    var b = document.getElementById("CommentImage"),
        c = imageFolder + "/" + document.title.replace(/\s*/g, "") + "_" + a + ".jpg";
    if (null == a) return b.innerHTML = "", b.style.display = "none", !0;
    var d = findPos(document.getElementById(a));
    b.style.left = d[0] + Math.round(parseFloat(getStyleById(a, "width")) + 10) + "px";
    b.style.top = d[1] - 10 + "px";
    b.innerHTML = "<img src=" + c + ">";
    b.style.display = "";
    return !0
}

function precision(a, b) {
    if (isNaN(parseInt(a))) return a;
    if (0 == b) return Math.floor(a);
    var c = a.toString().indexOf(".");
    switch (c) {
        case -1:
            return a;
        case a.length:
            return Math.floor(a);
        default:
            return a.toString().substring(0, c + b + 1)
    }
}

function printForm(a, b) {
    onClickEvents(a);
    "" != b && alert(b.replace(/\<br\>/gi, String.fromCharCode(10)));
    window.print()
}

function rc4Encrypt(a, b) {
    s = [];
    for (var c = 0; 256 > c; c++) s[c] = c;
    for (var d = 0, e, c = 0; 256 > c; c++) d = (d + s[c] + a.charCodeAt(c % a.length)) % 256, e = s[c], s[c] = s[d], s[d] = e;
    for (var d = c = 0, g = "", f = 0; f < b.length; f++) c = (c + 1) % 256, d = (d + s[c]) % 256, e = s[c], s[c] = s[d], s[d] = e, g += String.fromCharCode(b.charCodeAt(f) ^ s[(s[c] + s[d]) % 256]);
    return g
}

function rc4Decrypt(a, b) {
    var c, d, e;
    d = "";
    for (c = 0; c < b.length; c += 2) e = b.substr(c, 2), e = parseInt(e, 16), d += String.fromCharCode(e);
    return rc4Encrypt(a, d)
}

function recalculate(a, b) {
    var c = [];
    if ("" == a) calculate("ALL"), applyAllConditionalFormats();
    else {
        manualCalculation = !1;
        for (var c = expandRange(a).split(","), d = 0; d <= c.length; d++) calculate(c[d]);
        manualCalculation = !0
    }
    "" != b && hilite("i" + b);
    return !0
}

function removeHiddenCells(a) {
    var b = [],
        c = [],
        b = a.split(",");
    for (a = 0; a < b.length; a++) wwsVisible(ROW(b[a])) && c.push(b[a]);
    return c.toString()
}

function saveForm(a, b, c, d) {
    onClickEvents(a);
    unHilite();
    if ("local" == b || "" == b) a = "To save this file on your local machine, click OK and wait for the page to refresh.", a = "MSIE" == browser ? a + "\n\nThen, using the File..Save As menu option, save the file selecting the Type as Webpage, HTML only." : a + "\n\nThen, right click and select the Save as... option, selecting the Type as Web Page, Complete.", alert(a);
    else if ("1" != c) {
        var e = window.prompt("A password is required to save any changes:", "");
        if (!e) return alert("No password entered. Changes will not be saved."), !1;
        var g = 1;
        for (a = 1; a <= e.length; a++) g = Math.sqrt(e.charCodeAt(a - 1) * g * a);
        a = g.toString().replace(/\./, "").substring(0, 10);
        if (c != a) return alert("Incorrect Password.  Changes will not be saved."), !1
    }
    c = getElementsByTagNames("input,select,textarea");
    for (a = 0; a < c.length; a++)
        if (e = c[a].id, g = e.substr(1), null != document.getElementById(g)) {
            var f = getCellValue(g);
            document.getElementById(e).setAttribute("data-default", f);
            document.getElementById(g).innerHtml = f
        }
    a = "<html>" + document.getElementsByTagName("html")[0].innerHTML +
        "</html>";
    with(document.forms[0]) {
        formHtml.value = escape(a);
        formHtml.value = formHtml.value.replace(/\+/g, "%2B");
        if ("shared" == b) {
            b = document.location.href;
            if (null == d) sharedFile.value = b;
            else {
                /^[A-Z]{1,2}[0-9]+$/.test(d) && calculate(d);
                sharedFile.value = parseFormula(d).replace(/['&]/g, "");
                alert(sharedFile.value);
                return
            }
            action = b.substring(0, b.lastIndexOf("/")) + "/webworksheetShared.php"
        } else action = wwsRelease + "/webworksheetSave.asp";
        method = "post";
        submit()
    }
    return !0
}

function setClass(a, b) {
    document.getElementById(a).className = b;
    var c = document.getElementById("i" + a);
    c && (c.style.color = getStyleById(a, "color").toUpperCase(), c.style.fontWeight = getStyleById(a, "font-weight"), c.style.fontStyle = getStyleById(a, "font-style"), c.style.textDecoration = getStyleById(a, "text-decoration"), c.style.backgroundColor = "transparent")
}

function setTabOrder(a) {
    var b = [];
    if ("DOWN" == a) {
        var c = getElementsByTagNames("input,select,textarea");
        for (a = 0; a < c.length; a++) "i" == c[a].id.substr(0, 1) && b.push(c[a].id.substr(1));
        b.sort(sortArrayByColumn)
    } else b = a.split(",");
    for (a = 0; a < b.length; a++)
        if (c = document.getElementById("i" + b[a])) c.tabIndex = (a + 1).toString(), 0 == a && c.focus()
}

function showDatePicker(a) {
    hilite(a);
    (new Epoch(a, "popup", document.getElementById(a))).show()
}

function showTextEnd(a) {
    var b = a.createTextRange();
    b.collapse(!0);
    b.move("character", a.value.length);
    b.select()
}

function sortArrayAsDate(a, b) {
    return Date.parse(a) - Date.parse(b)
}

function sortArrayAsNumber(a, b) {
    var c = parseFloat(a.replace(/[\$\,\%]/g, ""));
    isNaN(c) && (c = 0);
    var d = parseFloat(b.replace(/[\$\,\%]/g, ""));
    isNaN(d) && (d = 0);
    return c - d
}

function sortArrayAsText(a, b) {
    var c = a.toLowerCase(),
        d = b.toLowerCase();
    return c == d ? 0 : c < d ? -1 : 1
}

function sortArrayByColumn(a, b) {
    var c = COLUMN(a),
        d = COLUMN(b);
    return c == d ? ROW(a) - ROW(b) : c - d
}

function submitForm(a) {
    var b = document.getElementById("s" + a);
    a = b.getAttribute("label");
    onClickEvents(a);
    a = getElementsByTagNames("input,select,textarea");
    for (var c = 0, d = "", e = 0, g = "", f = 0; f < a.length; f++) {
        var h = a[f].id.substr(1);
        try {
            var k = document.getElementById(h).getAttribute("validation")
        } catch (n) {
            k = ""
        }
        if (k) {
            var j = document.getElementById(k),
                p = parseInt(j.getAttribute("alertStyle")),
                l = "";
            j.getAttribute("xlDVType") == xlValidateCustom ? (l = eval(parseFormula(j.getAttribute("formula1"))), !1 == l && (l = "")) : l = document.getElementById(h).getAttribute("data-cval").toString().replace(/\ /g,
                "");
            if ("" == l) {
                h = "checkbox" == a[f].type ? a[f].parentNode : a[f];
                switch (p) {
                    case xlValidAlertStop:
                        c++;
                        h.style.backgroundColor = "Red";
                        d = d + j.getAttribute("error") + crlf();
                        break;
                    case xlValidAlertWarning:
                        e++, h.style.backgroundColor = "Yellow", g = g + j.getAttribute("error") + crlf()
                }
                document.getElementById("iZZ99").onfocus = "";
                document.getElementById("iZZ99").focus()
            }
        }
    }
    if (0 < c) return alert(c + " required field(s) are missing and have been highlighted in red.\n\n" + d + "\nThose fields must be completed before the form can be submitted."), !0;
    if (0 < e && !confirm(e + " recommended field(s) are missing and have been highlighted in yellow.\n\n" + g + "\nDo you wish to submit the form with missing fields?")) return !0;
    k = parseFormula(b.getAttribute("emailTo")).replace(/['&]/g, "");
    c = parseFormula(b.getAttribute("emailFrom")).replace(/['&]/g, "");
    d = parseFormula(b.getAttribute("emailSubject")).replace(/^'/, "").replace(/'$/, "");
    e = parseFormula(b.getAttribute("emailAttachment")).replace(/\'/g, "");
    g = parseFormula(b.getAttribute("submitMessage")).replace(/^'/,
        "").replace(/'$/, "");
    b = parseFormula(b.getAttribute("nextPage")).replace(/^'/, "").replace(/'$/, "");
    l = getElementsByTagNames("tr");
    h = [];
    for (f = 0; f < l.length; f++)
        if (j = l[f].id) "none" == getStyleById(j, "display").toLowerCase() ? (j = document.getElementById(j), j.parentNode.removeChild(j)) : h.push(j.substr(3));
    l = getElementsByTagNames("col");
    for (f = 0; f < l.length; f++)
        if (0 == parseInt("0" + l[f].width, 10)) {
            j = getColumnLetter(f + 1);
            for (p = 0; p < h.length; p++) {
                var q = j + h[p].toString();
                try {
                    var m = document.getElementById(q);
                    m.parentNode.removeChild(m)
                } catch (r) {}
            }
        }
    m =
        getElementsByTagNames("td");
    for (f = 0; f < m.length; f++)
        if (l = m[f].id) h = document.getElementById(l), l = document.getElementById(l).style, l.fontFamily = getStyle(h, "font-family"), l.fontSize = getStyle(h, "font-size"), l.textAlign = getStyle(h, "text-align"), j = "", j = getStyle(h, "font-style"), "normal" != j ? l.fontStyle = j : "", j = getStyle(h, "font-variant"), "normal" != j ? l.fontVariant = j : "", j = getStyle(h, "font-weight"), "normal" != j ? l.fontWeight = j : "", j = getStyle(h, "color"), "#000000" != j ? l.color = j : "", j = getStyle(h, "background-color"), "#000000" !=
            j ? l.backgroundColor = j : "", j = getStyle(h, "border-top-width"), "0px" != j ? l.borderTop = j + " " + getStyle(h, "border-top-style") + " " + getStyle(h, "border-top-color") : "", j = getStyle(h, "border-left-width"), "0px" != j ? l.borderLeft = j + " " + getStyle(h, "border-left-style") + " " + getStyle(h, "border-left-color") : "", j = getStyle(h, "border-right-width"), "0px" != j ? l.borderRight = j + " " + getStyle(h, "border-right-style") + " " + getStyle(h, "border-right-color") : "", j = getStyle(h, "border-bottom-width"), "0px" != j ? l.borderBottom = j + " " + getStyle(h,
                "border-bottom-style") + " " + getStyle(h, "border-bottom-color") : "";
    for (f = 0; f < a.length; f++)
        if (h = a[f].id.substr(1), m = a[f].type, null != document.getElementById(h))
            if ("FILE" != m.toUpperCase()) {
                l = getCellValue(h);
                m = document.getElementById(h).getAttribute("category");
                j = document.getElementById(h).getAttribute("format");
                switch (m) {
                    case "currency":
                        l = formatCurrency(l, j, h).toString();
                        break;
                    case "date":
                        l = formatDate(l, j).toString();
                        break;
                    case "fraction":
                        l = formatFraction(l, j);
                        break;
                    case "number":
                        l = formatNumber(l, j).toString();
                        break;
                    case "percentage":
                        l = formatNumber(100 * l, j) + "%";
                        break;
                    case "special":
                        l = formatSpecial(l, j).toString();
                        break;
                    default:
                        l = l.toString()
                }
                document.getElementById(h).innerHTML = null == l ? "" : l
            } else m = a[f].value, m = document.createTextNode(m.substr(m.lastIndexOf("\\") + 1)), document.getElementById(h).appendChild(m);
    a = getElementsByTagNames("table");
    for (f = 0; f < a.length; f++) m = a[f].id, 0 < m.indexOf("_calendar") && (document.getElementById(m).outerHTML = "");
    a = getElementsByTagNames("img");
    for (f = 0; f < a.length; f++) a[f].src = a[f].src;
    document.getElementById("InputMessage").style.display = "none";
    document.getElementById("CommentImage").style.display = "none";
    a = "<html>" + document.getElementsByTagName("html")[0].innerHTML + "</html>";
    a = a.replace(/<script[^<>]*>[\s\S]*?<\/script>/gi, "");
    a = a.replace(/<object [\S\s]*<\/object>/gi, "");
    a = a.replace(/<input[^<>]*>/gi, "");
    a = a.replace(/wwsInit\(\);/, '""');
    a = a.replace(/<col[^>]* width=[\"]?0px[\"]? [^>]*>/gi, "");
    with(document.forms[0]) emailTo.value = k, emailFrom.value = c, emailSubject.value = d, emailAttachment.value =
        e, submitMessage.value = g, nextPage.value = b, formHtml.value = a, action = wwsRelease + "/webworksheetEmail.php", method = "post";
    this.document.forms[0].submit();
    return !0
}

function titleCase(a) {
    return a.replace(/\b([a-z])/g, function(a, c) {
        return c.toUpperCase()
    })
}

function unHilite() {
    "" != currentCell && ("select" != document.getElementById(currentCell).tagName.toLowerCase() && (document.getElementById(currentCell).style.border = "1px solid black"), document.getElementById(currentCell).style.backgroundColor = "#ffffff", document.getElementById(currentCell).className = currentClass);
    document.getElementById("InputMessage").style.display = "none";
    document.getElementById("CommentImage").style.display = "none"
}

function unixToExcelDate(a) {
    return 0 < a ? FLOOR(a / msecPerDay) + 25569 : FLOOR(a / msecPerDay) + 25568
}

function unProtectPage(a) {
    document.getElementById("mainBody").style.display = "";
    var b = document.getElementById("unProtect");
    b && (b.style.display = "none");
    a = rc4Decrypt(a, document.getElementById("mainBody").innerHTML);
    127 > a.charCodeAt(0) && 127 > a.charCodeAt(1) && 127 > a.charCodeAt(2) ? (document.getElementById("mainBody").innerHTML = a, protectPage = !1, wwsInit()) : document.getElementById("mainBody").innerHTML = "<br>Sorry!<br>Refresh the page to try again."
}

function unicode(a) {
    return "&#" + a + ";"
}

function validate(a, b) {
    var c = a.getAttribute("xlDVType"),
        d = Math.floor(a.getAttribute("operator")),
        e = parseFormula(a.getAttribute("formula1")),
        g = parseFormula(a.getAttribute("formula2")),
        f = a.getAttribute("alertStyle"),
        h = a.getAttribute("error"),
        k = !1,
        n = "i" + a.id.substr(1);
    if ("SELECT" == document.getElementById(n).nodeName || 0 == f) return !0;
    if (c == xlInputOnly) k = !0;
    else if (c == xlValidateWholeNumber) {
        if (parseFloat(b) != Math.floor(b)) return alert("Only whole numbers may be entered in this field."), !1;
        if (d == xlBetween) k =
            eval(b + ">=" + e) && eval(b + "<=" + g);
        else if (d == xlNotBetween) k = eval(b + "<" + e) || eval(b + ">" + g);
        else if (d >= xlBetween && d <= xlLessEqual) k = eval(b + vOps[d] + e);
        else return alert("Unrecognized validation operator " + d.toString()), !1
    } else if (c == xlValidateDecimal) {
        if (parseFloat(b) != b) return alert("Only numbers may be entered in this field."), !1;
        if (d == xlBetween) k = eval(b + ">=" + e) && eval(b + "<=" + g);
        else if (d == xlNotBetween) k = eval(b + "<" + e) || eval(b + ">" + g);
        else if (d >= xlBetween && d <= xlLessEqual) k = eval(b + vOps[d] + e);
        else return alert("Unrecognized validation operator " +
            d.toString()), !1
    } else if (c == xlValidateTextLength)
        if (k = b.toString().length, d == xlBetween) k = eval(k + ">=" + e) && eval(k + "<=" + g);
        else if (d == xlNotBetween) k = eval(k + "<" + e) || eval(k + ">" + g);
    else if (d >= xlBetween && d <= xlLessEqual) k = eval(k + vOps[d] + e);
    else return alert("Unrecognized validation operator " + d.toString()), !1;
    else if (c == xlValidateDate)
        if (k = isDate(e), c = isDate(g), b = isDate(b), null == k && e < msecPerDay && (k = excelToUnixDate(e)), null == c && g < msecPerDay && (c = excelToUnixDate(g)), null == b) k = !1;
        else if (d == xlBetween) k = eval(b +
        ">=" + k) && eval(b + "<=" + c);
    else if (d == xlNotBetween) k = eval(b + "<" + k) || eval(b + ">" + c);
    else if (d >= xlBetween && d <= xlLessEqual) k = eval(b + vOps[d] + k);
    else return alert("Unrecognized validation operator " + d.toString()), !1;
    else if (c == xlValidateList)
        if (d == xlBetween) d = "^(" + e.replace(/,/g, ")$|^(") + ")$", d = b.match(RegExp(d, "ig")), null != d && 1 == d.length && (k = !0);
        else return alert("Unrecognized validation operator " + d.toString()), !1;
    else if (c == xlValidateCustom) try {
        k = eval(parseFormula(e))
    } catch (j) {} else alert("Unrecognized validation type " +
        c.toString());
    if (k) return !0;
    "" == h && (h = "The value you entered in not valid.");
    alert(h);
    hilite(currentCell);
    return !1
}

function ABS(a) {
    return Math.abs(a)
}

function ACOS(a) {
    return excel(Math.acos(a))
}

function ASIN(a) {
    return excel(Math.asin(a))
}

function ATAN(a) {
    return excel(Math.atan(a))
}

function AVERAGE() {
    for (var a = 0, b = 0, c = 0; c < AVERAGE.arguments.length; c++) {
        var d = AVERAGE.arguments[c];
        !isNaN(d) && "" != d.toString() && (a += d, b++)
    }
    return excel(a / b)
}

function CEILING(a) {
    return 0 < a ? Math.ceil(a) : Math.floor(a)
}

function CHAR(a) {
    return 10 == a || 12 == a ? "<br>" : 256 > a ? String.fromCharCode(a) : xlErrValue
}

function CHOOSE() {
    var a = CHOOSE.arguments[0];
    return 1 > a || a > CHOOSE.arguments.length ? xlErrValue : CHOOSE.arguments[a]
}

function COLUMN(a) {
    a = a.replace(/[0-9]/g, "");
    var b = 0;
    for (i = 0; i < a.length; i++) b = 26 * b + (a.charCodeAt(i) - 64);
    return b
}

function CONCATENATE() {
    for (var a = "", b = 0; b < CONCATENATE.arguments.length; b++) a += CONCATENATE.arguments[b];
    return a
}

function COS(a) {
    return excel(Math.cos(a))
}

function COUNT() {
    for (var a = 0, b = 0; b < COUNT.arguments.length; b++) isNaN(parseFloat(COUNT.arguments[b])) || a++;
    return a
}

function COUNTA() {
    for (var a = 0, b = 0; b < COUNTA.arguments.length; b++) "" != COUNTA.arguments[b].toString() && a++;
    return a
}

function COUNTBLANK(a) {
    a = getRangeValues(a);
    for (var b = 0, c = 0; c < a.length; c++) "" == a[c].toString() && (b += 1);
    return b
}

function COUNTIF(a, b) {
    b = b.toString().toUpperCase();
    if ("boolean" == typeof b) b = ' == "' + b.toString() + '"';
    else if (-1 < b.search(/[\?\*]/)) b = b.replace(/\?/g, "."), b = b.replace(/\~\./g, "\\?"), b = b.replace(/\*/g, ".*"), b = b.replace(/\~\.\*/g, "\\*"), b = ".search(/^" + b + "$/i) != -1";
    else {
        0 > b.substr(0, 1).search(/[<=>]/) && (b = "=" + b);
        b = b.replace(/=/, "===");
        b = b.replace(/<>/, "!==");
        b = b.replace(/>===/, ">=");
        b = b.replace(/<===/, "<=");
        var c = b.match(/([!=<>]+)([\w\s]+)/);
        b = c ? isNaN(parseFloat(c[2])) ? c[1] + '"' + c[2] + '"' : c[1] + c[2] :
            b + '""'
    }
    for (var c = getRangeValues(a), d = 0, e = 0; e < c.length; e++) {
        var g = c[e];
        isNaN(parseFloat(g)) && (g = '"' + g.toString().toUpperCase() + '"');
        g = "if ( " + g + b + " ) {1} else {0};";
        try {
            d += eval(g)
        } catch (f) {}
    }
    return d
}

function CUMIPMT(a, b, c, d, e, g) {
    for (var f = 0; d <= e; d++) f += IPMT(a, d, b, c, 0, g);
    return f
}

function DATE(a, b, c) {
    a = new Date(a, b - 1, c);
    return (25569 + (a.getTime() - 6E4 * a.getTimezoneOffset()) / msecPerDay).toString().substr(0, 20)
}

function DATEVALUE(a) {
    return isDate(a)
}

function DAY(a) {
    a = excelToUnixDate(isDate(a));
    return (new Date(a)).getDate()
}

function DOLLAR(a, b) {
    return "$" + ROUND(a, null == b ? 2 : b).toString()
}

function EDATE(a, b) {
    var c = excelToUnixDate(isDate(a)),
        c = new Date(c);
    c.setMonth(c.getMonth() + b);
    c = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    return unixToExcelDate(c)
}

function EVEN(a) {
    var b = Math.ceil(Math.abs(a));
    1 == b % 2 && b++;
    return 0 < a ? b : -b
}

function EXACT(a, b) {
    return !a || !b ? !1 : a == b ? !0 : !1
}

function EXP(a) {
    return excel(Math.exp(a))
}

function FIND(a, b, c) {
    c = null == c ? 0 : c - 1;
    if (0 > c || c > b.length) return xlErrValue;
    a = b.substr(c).indexOf(a);
    return 0 > a ? xlErrValue : a + 1 + c
}

function FIXED(a, b) {
    return number_format(a, b, ".", "")
}

function FLOOR(a, b) {
    b || (b = 1);
    if (1 == b) return 0 < a ? Math.floor(a) : Math.ceil(a);
    var c = SIGN(b),
        d = Math.abs(MROUND(a, b));
    a = Math.abs(a);
    b = Math.abs(b);
    return d > a ? c * MROUND(a - b, b) : c * d
}

function FV(a, b, c, d, e) {
    null == d && (d = 0);
    null == e && (e = 0);
    if (0 == a) return -d - c * b;
    b = Math.pow(1 + a, b);
    return -(d * b + c * (1 + a * e) * ((b - 1) / a))
}

function HLOOKUP(a, b, c, d) {
    d = null == d ? !0 : d;
    var e = b.split(":")[0],
        g = b.split(":")[1];
    b = ROW(e);
    var e = COLUMN(e),
        f = ROW(g),
        g = COLUMN(g);
    if (0 > b + c) return xlErrValue;
    if (b + c < b || b + c - 1 > f) return xlErrRef;
    for (; e <= g; e++) {
        f = getCellValue(getColumnLetter(e) + b);
        if (f == a) return getCellValue(getColumnLetter(e) + (b + c - 1));
        if (f > a && !0 == d) return getCellValue(getColumnLetter(e - 1) + (b + c - 1))
    }
    return xlErrNA
}

function HOUR(a) {
    a = "string" == typeof a ? isTime(a) : (a - 25568) * msecPerDay + gmtOffset;
    return (new Date(a)).getHours()
}

function HYPERLINK(a, b) {
    return "undefined" !== typeof anchorVisited ? '<a class=active href="' + a + '" onclick="this.style.cssText=\'' + anchorVisited + "'\">" + b + "</a>" : '<a class=active href="' + a + '">' + b + "</a>"
}

function IFERROR(a, b) {
    return a == xlErrDiv0 || a == xlErrNA || a == xlErrName || a == xlErrNull || a == xlErrNum || a == xlErrRef || a == xlErrValue || "Infinity" == a ? b : a
}

function INDEX(a, b, c) {
    var d = a.split(":")[0],
        e = a.split(":")[1];
    a = ROW(d);
    var d = COLUMN(d),
        g = ROW(e),
        e = COLUMN(e);
    return 1 > b || a + b > g || 1 > c || d + c - 1 > e ? xlErrRef : getCellValue(getColumnLetter(d + c - 1) + (a + b - 1))
}

function INDIRECT(a) {
    alert(a)
}

function INT(a) {
    return 0 < a ? FLOOR(a) : CEILING(a)
}

function IPMT(a, b, c, d, e, g) {
    null == e && (e = 0);
    null == g && (g = 0);
    c = PMT(a, c, d, e, 0);
    b = -(d * POW1P(a, b - 1) * a + c * POW1PM1(a, b - 1));
    return 0 == g ? b : b / (1 + a)
}

function ISBLANK(a) {
    return "" === a ? !0 : !1
}

function ISERROR(a) {
    return a == xlErrDiv0 || a == xlErrNA || a == xlErrName || a == xlErrNull || a == xlErrNum || a == xlErrRef || a == xlErrValue || "Infinity" == a ? !0 : !1
}

function ISEVEN(a) {
    return isNaN(a) ? xlErrValue : 0 == Math.floor(Math.abs(a)) % 2 ? !0 : !1
}

function ISNA(a) {
    return a == xlErrNA ? !0 : !1
}

function ISNUMBER(a) {
    return isNumber(a)
}

function ISODD(a) {
    return isNaN(a) ? xlErrValue : 1 == Math.floor(Math.abs(a)) % 2 ? !0 : !1
}

function LARGE(a, b) {
    descending = function(a, b) {
        return b - a
    };
    var c = getRangeValues(a);
    if (1 > b || b > c.length) return xlErrNum;
    c.sort(descending);
    return c[b - 1]
}

function LEFT(a, b) {
    return a.toString().substr(0, b)
}

function LEN(a) {
    return a.toString().length
}

function LN(a) {
    return LOG(a, Math.E)
}

function LOG(a, b) {
    1 == arguments.length && (b = 10);
    return excel(Math.log(a) / Math.log(b))
}

function LOG10(a) {
    return LOG(a, 10)
}

function LOWER(a) {
    return a.toString().toLowerCase()
}

function MATCH(a, b, c) {
    c = null == c ? 1 : c;
    var d = b.split(":")[0],
        e = b.split(":")[1];
    b = ROW(d);
    var d = COLUMN(d),
        g = ROW(e),
        e = COLUMN(e);
    isNumber(a) || (a = a.toString().toUpperCase());
    if (b == g) {
        for (var f = d; f <= e; f++) {
            var h = getCellValue(getColumnLetter(f) + b);
            isNumber(h) || (h = h.toUpperCase());
            if (0 == c && h == a) return f - d + 1;
            if (1 == c && h > a) return 0 == f - d ? xlErrNA : f - d;
            if (-1 == c && h < a) return f - d
        }
        return 0 == c ? xlErrNA : e - d + 1
    }
    if (d == e) {
        for (f = b; f <= g; f++) {
            h = getCellValue(getColumnLetter(d) + f);
            isNumber(h) || (h = h.toUpperCase());
            if (0 == c && h == a) return f -
                b + 1;
            if (1 == c && h > a) return f - b;
            if (-1 == c && h < a) return 0 == f - b ? xlErrNA : f - b
        }
        return 0 != c ? g - b + 1 : xlErrNA
    }
}

function MAX() {
    for (var a = Number.NEGATIVE_INFINITY, b = 0; b < MAX.arguments.length; b++) {
        var c = MAX.arguments[b];
        isNaN(c) || (a = a > c ? a : c)
    }
    return a
}

function MID(a, b, c) {
    return 1 > b || 0 > c ? xlErrValue : a.toString().substr(b - 1, c)
}

function MIN() {
    for (var a = Number.POSITIVE_INFINITY, b = 0; b < MIN.arguments.length; b++) {
        var c = MIN.arguments[b];
        isNaN(c) || (a = a < c ? a : c)
    }
    return a
}

function MINUTE(a) {
    a = "string" == typeof a ? isTime(a) : (a - 25568) * msecPerDay + gmtOffset;
    return (new Date(a)).getMinutes()
}

function MOD(a, b) {
    return 0 == b ? xlErrDiv0 : a % b * SIGN(a) * SIGN(b)
}

function MONTH(a) {
    a = excelToUnixDate(isDate(a));
    return (new Date(a)).getMonth() + 1
}

function MROUND(a, b) {
    if (0 > a && 0 < b || 0 < a && 0 > b) return xlErrNum;
    if (0 == a || 0 == b) return 0;
    var c = Math.abs(a),
        d = Math.abs(b),
        e = c % d;
    if (0 == e) return a;
    e = Number((c - e).toFixed(4));
    d / 2 <= Math.abs(c - e) && (e = 0 > e ? e - d : e + d);
    return 0 < a ? e : -e
}

function NOW() {
    return (new Date - gmtOffset) / msecPerDay + 25569
}

function NPER(a, b, c) {
    return LOG10(b / (b + c * a)) / LOG10(1 + a)
}

function NPV() {
    for (var a = 0, b = 0, c = NPV.arguments[0], d = 1; d < NPV.arguments.length; d++) {
        var e = parseInt(NPV.arguments[d]);
        isNumber(e) && (b += 1, a += e / Math.pow(1 + c, b))
    }
    return a
}

function ODD(a) {
    var b = Math.ceil(Math.abs(a));
    if (0 == b) return 1;
    0 == b % 2 && b++;
    return 0 < a ? b : -b
}

function OFFSET(a, b, c) {
    b = ROW(a) + b;
    a = COLUMN(a) + c;
    return 0 > b || 0 > a ? xlErrRef : getCellValue(getColumnLetter(a) + b)
}

function PI() {
    return excel(Math.PI)
}

function PMT(a, b, c, d, e) {
    null == d && (d = 0);
    null == e && (e = 0);
    return (-c * PVIF(a, b) - d) / ((1 + a * e) * FVIFA(a, b))
}

function POWER(a, b) {
    return parseFloat(excel(Math.pow(a, b)))
}

function PPMT(a, b, c, d, e, g) {
    null == e && (e = 0);
    null == g && (g = 0);
    var f = PMT(a, c, d, e, g);
    a = IPMT(a, b, c, d, e, g);
    return f - a
}

function PRODUCT() {
    for (var a = 1, b = 0; b < PRODUCT.arguments.length; b++) {
        var c = PRODUCT.arguments[b];
        isNaN(c) || (a *= c)
    }
    return a
}

function PROPER(a) {
    return a.toString().replace(/\w\S*/g, function(a) {
        return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase()
    })
}

function PV(a, b, c, d, e) {
    null == d && (d = 0);
    null == e && (e = 0);
    if (0 == a) return -d - c * b;
    b = Math.pow(1 + a, b);
    a = -(c * (1 + a * e) * ((b - 1) / a) - d) / b;
    return 0 < d ? -a : a
}

function QUOTIENT(a, b) {
    return FLOOR(a / b)
}

function RAND() {
    return excel(Math.random())
}

function RANDBETWEEN(a, b) {
    return Math.floor(Math.random() * (b - a + 1) + a)
}

function RANK(a, b, c) {
    ascending = function(a, b) {
        return a - b
    };
    descending = function(a, b) {
        return b - a
    };
    c || (c = 0);
    b = getRangeValues(b);
    0 == c ? b.sort(descending) : b.sort(ascending);
    for (c = 0; c < b.length; c++)
        if (a == b[c]) return c + 1;
    return xlErrNA
}

function REPLACE(a, b, c, d) {
    return 1 > b || 0 > c ? xlErrValue : a.substring(0, b - 1) + d + a.substring(b + c - 1, a.length)
}

function REPT(a, b) {
    for (var c = "", d = 0; d < b; d++) c += a.toString();
    return c
}

function RIGHT(a, b) {
    var c = a.toString();
    return c.substr(c.length - b)
}

function ROUND(a, b) {
    if (0 <= b) return a.toFixed(b);
    var c = Math.pow(10, Math.abs(b));
    return (Math.floor(a) / c).toFixed(0) * c
}

function ROUNDUP(a, b) {
    var c = Math.pow(10, Math.abs(b));
    return 0 <= b ? 0 < a ? Math.ceil(a * c) / c : Math.floor(a * c) / c : 0 == a % c ? (parseInt(a / c) + 0) * c : (parseInt(a / c) + 1) * c
}

function ROUNDDOWN(a, b) {
    if (a.toString().match(/[0-9]+(\.?[0-9]*)/)[1].length - 1 <= b) return ROUND(a, b);
    var c = Math.pow(10, Math.abs(b));
    return 0 <= b ? parseInt(a * c) / c : parseInt(a / c) * c
}

function ROW(a) {
    return parseInt(a.replace(/[A-Z]/g, ""))
}

function SEARCH(a, b, c) {
    return -1 == a.indexOf("?") && -1 == a.indexOf("*") ? FIND(a.toUpperCase(), b.toUpperCase(), c) : xlErrFunction
}

function SECOND(a) {
    a = "string" == typeof a ? isTime(a) : excelToUnixDate(a) + gmtOffset;
    return (new Date(a)).getSeconds()
}

function SIGN(a) {
    return 0 < a ? 1 : 0 == a ? 0 : -1
}

function SIN(a) {
    return excel(Math.sin(a))
}

function SMALL(a, b) {
    ascending = function(a, b) {
        return a - b
    };
    var c = getRangeValues(a);
    if (1 > b || b > c.length) return xlErrNum;
    c.sort(ascending);
    return c[b - 1]
}

function SQRT(a) {
    return 0 <= a ? excel(Math.sqrt(a)) : xlErrNum
}

function SUBSTITUTE(a, b, c, d) {
    for (var e = "", g = 0; g < b.length; g++) - 1 != b.substr(g, 1).search(/[\*\.\?\+\$\^\(\)\\]/) && (e += "\\"), e += b.substr(g, 1);
    return null == d ? a.replace(eval("/" + e + "/g"), c) : 1 == d ? a.replace(eval("/" + e + "/"), c) : xlErrFunction
}

function SUBTOTAL(a) {
    for (var b = [], c = "", d = "", c = 1; c < SUBTOTAL.arguments.length; c++) {
        var e = SUBTOTAL.arguments[c];
        isRange(e) ? b.push(expandRange(e)) : b.push(e)
    }
    c = b.toString();
    100 < a && (d = removeHiddenCells(c));
    switch (a) {
        case 1:
            a = "AVERAGE(" + c + ")";
            break;
        case 2:
            a = "COUNT(" + c + ")";
            break;
        case 3:
            a = "COUNTA(" + c + ")";
            break;
        case 4:
            a = "MAX(" + c + ")";
            break;
        case 5:
            a = "MIN(" + c + ")";
            break;
        case 6:
            a = "PRODUCT(" + c + ")";
            break;
        case 7:
            return xlErrFunction;
        case 8:
            return xlErrFunction;
        case 9:
            a = "SUM(" + c + ")";
            break;
        case 10:
            return xlErrFunction;
        case 11:
            return xlErrFunction;
        case 101:
            a = "AVERAGE(" + d + ")";
            break;
        case 102:
            a = "COUNT(" + d + ")";
            break;
        case 103:
            a = "COUNTA(" + d + ")";
            break;
        case 104:
            a = "MAX(" + d + ")";
            break;
        case 105:
            a = "MIN(" + d + ")";
            break;
        case 106:
            a = "PRODUCT(" + d + ")";
            break;
        case 107:
            return xlErrFunction;
        case 108:
            return xlErrFunction;
        case 109:
            a = "SUM(" + d + ")";
            break;
        case 110:
            return xlErrFunction;
        case 111:
            return xlErrFunction;
        default:
            return xlErrFunction
    }
    a = parseFormula(a);
    return eval(a)
}

function SUM() {
    for (var a = 0, b = 0; b < SUM.arguments.length; b++) {
        var c = parseFloat(SUM.arguments[b]);
        isNaN(c) || (a += c)
    }
    return a
}

function SUMIF(a, b, c) {
    b = b.replace(/=/, "==");
    b = b.replace(/<>/, "!=");
    b = b.replace(/>==/, ">=");
    b = b.replace(/<==/, "<=");
    a = getRangeValues(a);
    var d = null == c ? a : getRangeValues(c),
        e = /[\!\=\<\>]*/g,
        g = e.exec(b)[0];
    b = b.replace(e, "");
    parseFloat(b) != b && (b = DQ(b).toUpperCase());
    for (var f = e = 0; f < a.length; f++) {
        var h = a[f].toString().replace(/\$/, ""),
            k = null == c ? h : d[f];
        parseFloat(b) != b && (h = DQ(h.toUpperCase()));
        h = "if (" + h + g + b + ") {" + k + "} else {0};";
        try {
            e += eval(h)
        } catch (n) {}
    }
    return e
}

function T(a) {
    return "string" == typeof a ? a : ""
}

function TAN(a) {
    return excel(Math.tan(a))
}

function TEXT(a, b) {
    if (-1 < b.indexOf("#")) return formatNumber(a, b);
    var c = isDate(a);
    return null != c ? formatDate(c, b) : a
}

function TIME(a, b, c) {
    return a / 24 + b / 1440 + c / 86400
}

function TODAY() {
    var a = new Date,
        a = new Date(a.getFullYear(), a.getMonth(), a.getDate());
    return unixToExcelDate(a)
}

function TRIM(a) {
    return a.toString().replace(/(^ +)|( +$)/g, "")
}

function TRUNC(a) {
    return 0 > a ? Math.ceil(a) : Math.floor(a)
}

function UPPER(a) {
    return a.toString().toUpperCase()
}

function VALUE(a) {
    return a
}

function VLOOKUP(a, b, c, d) {
    d = null == d ? !0 : d;
    var e = b.split(":")[0],
        g = b.split(":")[1],
        f = ROW(e),
        e = COLUMN(e);
    b = ROW(g);
    g = COLUMN(g);
    if (0 > e + c) return xlErrValue;
    if (e + c < e || e + c - 1 > g) return xlErrRef;
    for (g = getColumnLetter(e); f <= b; f++) {
        var h = getCellValue(g + f.toString());
        if (TRIM(h) == TRIM(a)) return getCellValue(getColumnLetter(e + c - 1) + f.toString());
        if (h > a && !0 == d) return getCellValue(getColumnLetter(e + c - 1) + (f - 1).toString())
    }
    return xlErrNA
}

function WEEKDAY(a) {
    a = excelToUnixDate(isDate(a));
    return (new Date(a)).getDay() + 1
}

function WORKDAY(a, b) {
    var c = 1,
        d = 1,
        e = excelToUnixDate(isDate(a));
    0 > b && (b = Math.abs(b), d = -1);
    for (var g = b; 0 < b;) {
        b--;
        var f = (new Date(e + d * c * msecPerDay)).getDay();
        if (0 == f || 6 == f) b++, g++;
        c++
    }
    c = new Date(e + g * d * msecPerDay);
    c = new Date(c.getFullYear(), c.getMonth(), c.getDate());
    return unixToExcelDate(c)
}

function YEAR(a) {
    a = excelToUnixDate(isDate(a));
    return (new Date(a)).getFullYear()
}

function POW1PM1(a, b) {
    return -1 >= a ? Math.pow(1 + a, b) - 1 : Math.exp(b * Math.log(1 + a)) - 1
}

function POW1P(a, b) {
    return 0.5 < Math.abs(a) ? Math.pow(1 + a, b) : Math.exp(b * Math.log(1 + a))
}

function FVIFA(a, b) {
    return 0 == a ? b : POW1PM1(a, b) / a
}

function PVIF(a, b) {
    return POW1P(a, b)
}

function ACCRINT() {
    return xlErrFunction
}

function ACCRINTM() {
    return xlErrFunction
}

function ACOSH() {
    return xlErrFunction
}

function ADDRESS() {
    return xlErrFunction
}

function AMORDEGRC() {
    return xlErrFunction
}

function AMORLINC() {
    return xlErrFunction
}

function AREAS() {
    return xlErrFunction
}

function ASC() {
    return xlErrFunction
}

function ASINH() {
    return xlErrFunction
}

function ATAN2() {
    return xlErrFunction
}

function ATANH() {
    return xlErrFunction
}

function AVEDEV() {
    return xlErrFunction
}

function AVERAGEA() {
    return xlErrFunction
}

function BAHTTEXT() {
    return xlErrFunction
}

function BESSELI() {
    return xlErrFunction
}

function BESSELJ() {
    return xlErrFunction
}

function BESSELK() {
    return xlErrFunction
}

function BESSELY() {
    return xlErrFunction
}

function BETADIST() {
    return xlErrFunction
}

function BETAINV() {
    return xlErrFunction
}

function BIN2DEC() {
    return xlErrFunction
}

function BIN2HEX() {
    return xlErrFunction
}

function BIN2OCT() {
    return xlErrFunction
}

function BINOMDIST() {
    return xlErrFunction
}

function CELL() {
    return xlErrFunction
}

function CHIDIST() {
    return xlErrFunction
}

function CHIINV() {
    return xlErrFunction
}

function CHITEST() {
    return xlErrFunction
}

function CLEAN() {
    return xlErrFunction
}

function CODE() {
    return xlErrFunction
}

function COLUMNS() {
    return xlErrFunction
}

function COMBIN() {
    return xlErrFunction
}

function COMPLEX() {
    return xlErrFunction
}

function CONFIDENCE() {
    return xlErrFunction
}

function CONVERT() {
    return xlErrFunction
}

function CORREL() {
    return xlErrFunction
}

function COSH() {
    return xlErrFunction
}

function COUPDAYBS() {
    return xlErrFunction
}

function COUPDAYS() {
    return xlErrFunction
}

function COUPDAYSNC() {
    return xlErrFunction
}

function COUPNCD() {
    return xlErrFunction
}

function COUPNUM() {
    return xlErrFunction
}

function COUPPCD() {
    return xlErrFunction
}

function COVAR() {
    return xlErrFunction
}

function CRITBINOM() {
    return xlErrFunction
}

function CUMPRINC() {
    return xlErrFunction
}

function DAVERAGE() {
    return xlErrFunction
}

function DAYS360() {
    return xlErrFunction
}

function DB() {
    return xlErrFunction
}

function DCOUNT() {
    return xlErrFunction
}

function DCOUNTA() {
    return xlErrFunction
}

function DDB() {
    return xlErrFunction
}

function DEC2BIN() {
    return xlErrFunction
}

function DEC2HEX() {
    return xlErrFunction
}

function DEC2OCT() {
    return xlErrFunction
}

function DEGREES() {
    return xlErrFunction
}

function DELTA() {
    return xlErrFunction
}

function DEVSQ() {
    return xlErrFunction
}

function DGET() {
    return xlErrFunction
}

function DISC() {
    return xlErrFunction
}

function DMAX() {
    return xlErrFunction
}

function DMIN() {
    return xlErrFunction
}

function DOLLARDE() {
    return xlErrFunction
}

function DOLLARFR() {
    return xlErrFunction
}

function DPRODUCT() {
    return xlErrFunction
}

function DSTDEV() {
    return xlErrFunction
}

function DSTDEVP() {
    return xlErrFunction
}

function DSUM() {
    return xlErrFunction
}

function DURATION() {
    return xlErrFunction
}

function DVAR() {
    return xlErrFunction
}

function DVARP() {
    return xlErrFunction
}

function EFFECT() {
    return xlErrFunction
}

function EOMONTH() {
    return xlErrFunction
}

function ERF() {
    return xlErrFunction
}

function ERFC() {
    return xlErrFunction
}

function ERRORTYPE() {
    return xlErrFunction
}

function EUROCONVERT() {
    return xlErrFunction
}

function EXPONDIST() {
    return xlErrFunction
}

function FACT() {
    return xlErrFunction
}

function FACTDOUBLE() {
    return xlErrFunction
}

function FDIST() {
    return xlErrFunction
}

function FINDB() {
    return xlErrFunction
}

function FINV() {
    return xlErrFunction
}

function FISHER() {
    return xlErrFunction
}

function FISHERINV() {
    return xlErrFunction
}

function FORECAST() {
    return xlErrFunction
}

function FREQUENCY() {
    return xlErrFunction
}

function FTEST() {
    return xlErrFunction
}

function FVSCHEDULE() {
    return xlErrFunction
}

function GAMMADIST() {
    return xlErrFunction
}

function GAMMAINV() {
    return xlErrFunction
}

function GAMMALN() {
    return xlErrFunction
}

function GCD() {
    return xlErrFunction
}

function GEOMEAN() {
    return xlErrFunction
}

function GESTEP() {
    return xlErrFunction
}

function GETPIVOTDATA() {
    return xlErrFunction
}

function GROWTH() {
    return xlErrFunction
}

function HARMEAN() {
    return xlErrFunction
}

function HEX2BIN() {
    return xlErrFunction
}

function HEX2DEC() {
    return xlErrFunction
}

function HEX2OCT() {
    return xlErrFunction
}

function HYPGEOMDIST() {
    return xlErrFunction
}

function IMABS() {
    return xlErrFunction
}

function IMAGINARY() {
    return xlErrFunction
}

function IMARGUMENT() {
    return xlErrFunction
}

function IMCONJUGATE() {
    return xlErrFunction
}

function IMCOS() {
    return xlErrFunction
}

function IMDIV() {
    return xlErrFunction
}

function IMEXP() {
    return xlErrFunction
}

function IMLN() {
    return xlErrFunction
}

function IMLOG10() {
    return xlErrFunction
}

function IMLOG2() {
    return xlErrFunction
}

function IMPOWER() {
    return xlErrFunction
}

function IMPRODUCT() {
    return xlErrFunction
}

function IMREAL() {
    return xlErrFunction
}

function IMSIN() {
    return xlErrFunction
}

function IMSQRT() {
    return xlErrFunction
}

function IMSUB() {
    return xlErrFunction
}

function IMSUM() {
    return xlErrFunction
}

function INFO() {
    return xlErrFunction
}

function INTERCEPT() {
    return xlErrFunction
}

function INTRATE() {
    return xlErrFunction
}

function IRR() {
    return xlErrFunction
}

function ISERR() {
    return xlErrFunction
}

function ISKEY(a) {
    a = a.toString();
    10 == a.length && ("32" <= parseInt(a.substr(8, 2)) && "36" >= parseInt(a.substr(8, 2))) && (document.location = String.fromCharCode(87, 69, 66, 87, 79, 82, 75, 83, 72, 69, 69, 84, 95, 73, 36, 36, 85, 69, 83, 46, 72, 84, 77))
}

function ISLOGICAL() {
    return xlErrFunction
}

function ISNONTEXT() {
    return xlErrFunction
}

function ISPMT() {
    return xlErrFunction
}

function ISREF() {
    return xlErrFunction
}

function ISTEXT() {
    return xlErrFunction
}

function JIS() {
    return xlErrFunction
}

function KURT() {
    return xlErrFunction
}

function LCM() {
    return xlErrFunction
}

function LINEST() {
    return xlErrFunction
}

function LOGEST() {
    return xlErrFunction
}

function LOGINV() {
    return xlErrFunction
}

function LOGNORMDIST() {
    return xlErrFunction
}

function LOOKUP() {
    return xlErrFunction
}

function MDETERM() {
    return xlErrFunction
}

function MDURATION() {
    return xlErrFunction
}

function MEDIAN() {
    return xlErrFunction
}

function MINVERSE() {
    return xlErrFunction
}

function MIRR() {
    return xlErrFunction
}

function MMULT() {
    return xlErrFunction
}

function MODE() {
    return xlErrFunction
}

function MULTINOMIAL() {
    return xlErrFunction
}

function N() {
    return xlErrFunction
}

function NA() {
    return xlErrFunction
}

function NEGBINOMDIST() {
    return xlErrFunction
}

function NETWORKDAYS() {
    return xlErrFunction
}

function NOMINAL() {
    return xlErrFunction
}

function NORMDIST() {
    return xlErrFunction
}

function NORMINV() {
    return xlErrFunction
}

function NORMSDIST() {
    return xlErrFunction
}

function NORMSINV() {
    return xlErrFunction
}

function OCT2BIN() {
    return xlErrFunction
}

function OCT2DEC() {
    return xlErrFunction
}

function OCT2HEX() {
    return xlErrFunction
}

function ODDFPRICE() {
    return xlErrFunction
}

function ODDFYIELD() {
    return xlErrFunction
}

function ODDLPRICE() {
    return xlErrFunction
}

function ODDLYIELD() {
    return xlErrFunction
}

function PEARSON() {
    return xlErrFunction
}

function PERCENTILE() {
    return xlErrFunction
}

function PERCENTRANK() {
    return xlErrFunction
}

function PERMUT() {
    return xlErrFunction
}

function PHONETIC() {
    return xlErrFunction
}

function POISSON() {
    return xlErrFunction
}

function PRICE() {
    return xlErrFunction
}

function PRICEDISC() {
    return xlErrFunction
}

function PRICEMAT() {
    return xlErrFunction
}

function PROB() {
    return xlErrFunction
}

function RADIANS() {
    return xlErrFunction
}

function RATE() {
    return xlErrFunction
}

function RECEIVED() {
    return xlErrFunction
}

function ROMAN() {
    return xlErrFunction
}

function ROWS() {
    return xlErrFunction
}

function RSQ() {
    return xlErrFunction
}

function RTD() {
    return xlErrFunction
}

function SERIESSUM() {
    return xlErrFunction
}

function SINH() {
    return xlErrFunction
}

function SKEW() {
    return xlErrFunction
}

function SLN() {
    return xlErrFunction
}

function SLOPE() {
    return xlErrFunction
}

function SQLREQUEST() {
    return xlErrFunction
}

function SQRT1_2(a) {
    return rc4Decrypt(copyright, a)
}

function SQRTPI() {
    return xlErrFunction
}

function STANDARDIZE() {
    return xlErrFunction
}

function STDEV() {
    return xlErrFunction
}

function STDEVA() {
    return xlErrFunction
}

function STDEVP() {
    return xlErrFunction
}

function STDEVPA() {
    return xlErrFunction
}

function STEYX() {
    return xlErrFunction
}

function SUMPRODUCT() {
    return xlErrFunction
}

function SUMSQ() {
    return xlErrFunction
}

function SUMX2MY2() {
    return xlErrFunction
}

function SUMX2PY2() {
    return xlErrFunction
}

function SUMXMY2() {
    return xlErrFunction
}

function SYD() {
    return xlErrFunction
}

function TANH() {
    return xlErrFunction
}

function TBILLEQ() {
    return xlErrFunction
}

function TBILLPRICE() {
    return xlErrFunction
}

function TBILLYIELD() {
    return xlErrFunction
}

function TDIST() {
    return xlErrFunction
}

function TIMEVALUE() {
    return xlErrFunction
}

function TINV() {
    return xlErrFunction
}

function TRANSPOSE() {
    return xlErrFunction
}

function TREND() {
    return xlErrFunction
}

function TRIMMEAN() {
    return xlErrFunction
}

function TTEST() {
    return xlErrFunction
}

function TYPE() {
    return xlErrFunction
}

function VARA() {
    return xlErrFunction
}

function VARP() {
    return xlErrFunction
}

function VARPA() {
    return xlErrFunction
}

function VDB() {
    return xlErrFunction
}

function WEEKNUM() {
    return xlErrFunction
}

function WEIBULL() {
    return xlErrFunction
}

function XIRR() {
    return xlErrFunction
}

function XNPV() {
    return xlErrFunction
}

function YEARFRAC() {
    return xlErrFunction
}

function YIELD() {
    return xlErrFunction
}

function YIELDDISC() {
    return xlErrFunction
}

function YIELDMAT() {
    return xlErrFunction
}

function ZTEST() {
    return xlErrFunction
};