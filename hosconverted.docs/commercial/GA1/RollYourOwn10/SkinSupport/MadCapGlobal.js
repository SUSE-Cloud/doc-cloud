/// <reference path="jquery.js" />
/// <reference path="MadCapDom.js" />

/*!
* Copyright MadCap Software
* http://www.madcapsoftware.com/
*
* v10.2.2.0
*/

/*
MadCap
*/

var MadCap = {};

MadCap.CreateNamespace = function (name)
{
    var names = name.split(".");
    var o = MadCap;

    for (var j = 0, length = names.length; j < length; j++)
    {
        var name = names[j];

        if (name == "MadCap")
            continue;

        if (typeof (o[name]) != "undefined")
        {
            o = o[name];
            continue;
        }

        o[name] = {};
        o = o[name];
    }

    return o;
};

// Object.create() polyfill for IE 8 and below from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create)
{
    Object.create = function (o)
    {
        if (arguments.length > 1)
            throw new Error('Object.create implementation only accepts the first parameter.');

        function F() { }
        F.prototype = o;
        return new F();
    };
}

MadCap.Extend = function (baseClass, subClass)
{
    subClass.prototype = Object.create(baseClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.prototype.base = baseClass.prototype;
};

//

MadCap.Exception = function (number, message)
{
    // Public properties

    this.Number = number;
    this.Message = message;
};

MadCap.IsIOS = function ()
{
    return MadCap.String.Contains(navigator.userAgent, "iphone") || MadCap.String.Contains(navigator.userAgent, "ipad");
};

MadCap.IsSafari = function () {
    return MadCap.String.Contains(navigator.userAgent, "safari") && !MadCap.String.Contains(navigator.userAgent, "chrome");
};

/*
String helpers
*/

(function ()
{
    var S = MadCap.CreateNamespace("String");

    S.IsNullOrEmpty = function (str)
    {
        if (str == null)
            return true;

        if (str.length == 0)
            return true;

        return false;
    };

    S.StartsWith = function (str1, str2, caseSensitive)
    {
        if (str2 == null)
            return false;

        if (str1.length < str2.length)
            return false;

        var value1 = str1;
        var value2 = str2;

        if (!caseSensitive)
        {
            value1 = value1.toLowerCase();
            value2 = value2.toLowerCase();
        }

        if (value1.substring(0, value2.length) == value2)
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    S.EndsWith = function (str1, str2, caseSensitive)
    {
        if (str2 == null)
            return false;

        if (str1.length < str2.length)
            return false;

        var value1 = str1;
        var value2 = str2;

        if (!caseSensitive)
        {
            value1 = value1.toLowerCase();
            value2 = value2.toLowerCase();
        }

        if (value1.substring(value1.length - value2.length) == value2)
        {
            return true;
        }
        else
        {
            return false;
        }
    };

    S.Contains = function (str1, str2, caseSensitive)
    {
        var value1 = caseSensitive ? str1 : str1.toLowerCase();

        if ($.isArray(str2))
        {
            for (var i = 0, length = str2.length; i < length; i++)
            {
                var value2 = caseSensitive ? str2[i] : str2[i].toLowerCase();

                if (value1.indexOf(value2) != -1)
                    return true;
            }

            return false;
        }

        var value2 = caseSensitive ? str2 : str2.toLowerCase();

        return value1.indexOf(value2) != -1;
    };

    S.Trim = function (str)
    {
        return S.TrimRight(S.TrimLeft(str));
    }

    S.TrimLeft = function (str)
    {
        var i = 0;
        var length = str.length;

        for (i = 0; i < length && str.charAt(i) == " "; i++);

        return str.substring(i, str.length);
    };

    S.TrimRight = function (str)
    {
        var i = 0;

        for (i = str.length - 1; i >= 0 && str.charAt(i) == " "; i--);

        return str.substring(0, i + 1);
    };

    S.ToBool = function (str, defaultValue)
    {
        var boolValue = defaultValue;

        if (str != null)
        {
            var stringValLower = str.toLowerCase();

            if (stringValLower != "true" && stringValLower != "false" && stringValLower != "1" && stringValLower != "0" && stringValLower != "yes" && stringValLower != "no")
            {
                throw new MadCap.Exception(-1, "The string can not be converted to a boolean value.");
            }

            boolValue = stringValLower == "true" || stringValLower == "1" || stringValLower == "yes";
        }

        return boolValue;
    };

    S.ToInt = function (str, defaultValue)
    {
        var intValue = defaultValue;

        if (str != null)
            intValue = parseInt(str);

        return intValue;
    };

    S.ToDashed = function (str)
    {
        return str.replace(/([A-Z])/g, function ($1) { return "-" + $1.toLowerCase(); });
    };
})();

(function ()
{
    MadCap.CreateNamespace("DEBUG");

    var DEBUG = MadCap.DEBUG;

    DEBUG.Log = {};

    DEBUG.Log.Create = function ()
    {
        var containerEl = document.createElement("div");
        containerEl.setAttribute("id", "DEBUG_Log");

        var headerEl = document.createElement("div");
        $(headerEl).addClass("MCDebugLogHeader");
        headerEl.appendChild(document.createTextNode("Log Console"));
        containerEl.appendChild(headerEl);

        var bodyEl = document.createElement("div");
        $(bodyEl).addClass("MCDebugLogBody");
        containerEl.appendChild(bodyEl);

        var footerEl = document.createElement("div");
        $(footerEl).addClass("MCDebugLogFooter");
        containerEl.appendChild(footerEl);

        document.body.appendChild(containerEl);

        // Set up drag & drop.
        var dd = new MadCap.DragDrop(containerEl, headerEl);
    };

    DEBUG.Log._LoadTime = new Date();

    DEBUG.Log.AddLine = function (message)
    {
        if (parent != window)
        {
            MadCap.Utilities.CrossFrame.PostMessageRequest(parent, "DEBUG-AddLine", [message], null);
            return;
        }

        var logEl = document.getElementById("DEBUG_Log");

        if (logEl == null)
            return;

        // Create the entry time element
        var now = new Date();
        var timeDiff = now - DEBUG.Log._LoadTime;
        var entryTimeEl = document.createElement("p");
        $(entryTimeEl).addClass("MCDebugLogEntryTime");
        entryTimeEl.appendChild(document.createTextNode(timeDiff + "ms" + " " + now.toLocaleTimeString()));

        // Create the entry element
        var entryEl = document.createElement("div");
        $(entryEl).addClass("MCDebugLogEntry");
        entryEl.appendChild(entryTimeEl);
        entryEl.appendChild(document.createTextNode(message));

        var logBodyEl = MadCap.Dom.GetElementsByClassName("MCDebugLogBody", "div", logEl)[0];
        logBodyEl.insertBefore(entryEl, logBodyEl.firstChild);
    };
})();
