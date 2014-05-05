(function() {
    "use strict";
    // (NEED COMMENTARY)
    var addEventCapabilities = function (object) {
        object = object || {};

        object.listenersFor = {};
        object.listenersCount = 0;
        object.specialEmiter = {};

        object.addEventListener = function (eventName, callback, priority,tag) {
            priority = (isNaN(priority) ? 0 : priority);
            var id = object.listenersCount++;
            if (!object.listenersFor[eventName]) {
                object.listenersFor[eventName] = [];
            }
            object.listenersFor[eventName].push({id:id,callback:callback, priority:priority, tag:tag});
            object.listenersFor[eventName].sort(function(a,b) {
                return (b.priority-a.priority);
            })
            return id;
        };

        object.removeListenerById = function (id) {
            for (var eventName in object.listenersFor) {
                var listeners = object.listenersFor[eventName];
                for (var i = listeners.length - 1; i >= 0; i--) {
                    if (listeners[i].id == id) {
                        listeners.splice(i,1);
                    }
                }
            }
        };
        
        object.removeListenerByTag = function (tag) {
            for (var eventName in object.listenersFor) {
                var listeners = object.listenersFor[eventName];
                for (var i = listeners.length - 1; i >= 0; i--) {
                    if (listeners[i].tag == tag) {
                        listeners.splice(i,1);
                    }
                }
            }
        };

        object.removeEventListener = function(name,callback) {
            if (!object.listenersFor[name]) {
                return;
            }
            for (var i = object.listenersFor[name].length - 1; i >= 0; i--) {
                if (object.listenersFor[name][i].callback == callback) {
                    object.listenersFor[name].splice(i,1);
                    return;
                }
            }
        };

        object.removeAllListener = function() {
            object.listenersFor = {};
            object.listenersCount = 0;
        };

        object.emit = function (eventName, eventParams) {
            var listeners   = object.listenersFor[eventName] || [];
            eventParams = eventParams || {};
            eventParams.stopPropagation = false;

            var callback = function() {
                for (var i=0; i < listeners.length; i++) {
                    try {
                        listeners[i].callback.call(object, eventParams);
                        if (eventParams.stopPropagation) {
                            return false;
                        }
                    } catch (e) {
                        console.error('Error on event '+eventName);
                        throw(e);
                    }
                }
                return true;
            };
            
            if (!!this.specialEmiter[eventName]) {
                this.specialEmiter[eventName].call(object, callback, eventParams);
            } else {
                callback();
            }

            return eventParams;
        };


        object.addSpecialEmiter = function (eventName, callback) {
            this.specialEmiter[eventName] = callback;
        };

        object.removeSpecialEmiter = function(eventName) {
            delete this.specialEmiter[eventName];
        };

        object.on = object.addEventListener;

        return object;

    };

    /*********************************************************\
        MULTI EXPORT
    \*********************************************************/
    
    if (typeof exports === 'object') {
        module.exports = addEventCapabilities;
    } else if (typeof define === 'function') {
        define(function() { return addEventCapabilities; });
    } else if (typeof GrifGame === 'object') {
        GrifGame.addEventCapabilities = addEventCapabilities;
    } else {
        this.addEventCapabilities = addEventCapabilities;
    }
}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());

