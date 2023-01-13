/*
    requestAnimationFrame polyfill
*/
let multipleCalls = window.localStorage.getItem('spins');

(function (w) {
    var lastTime = 0,
        vendors = ['webkit', /*'moz',*/ 'o', 'ms'];
    for (var i = 0; i < vendors.length && !w.requestAnimationFrame; ++i) {
        w.requestAnimationFrame = w[vendors[i] + 'RequestAnimationFrame'];
        w.cancelAnimationFrame = w[vendors[i] + 'CancelAnimationFrame']
            || w[vendors[i] + 'CancelRequestAnimationFrame'];
    }

    if (!w.requestAnimationFrame)
        w.requestAnimationFrame = function (callback, element) {
            var currTime = +new Date(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = w.setTimeout(function () { callback(currTime + timeToCall) }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!w.cancelAnimationFrame)
        w.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
})(this);

/*
    Slot Machine
*/
var sm = (function (undefined) {

    var tMax = 3000, // animation time, ms
        height = 210,
        speeds = [],
        r = [],
        reels = [
            ['M', 'J', 'D'],
            ['J', 'D', 'M'],
            ['D', 'M', 'J']
        ],
        $reels, $msg,
        start;

    function init() {
        $reels = $('.reel').each(function (i, el) {
            el.innerHTML = '<div><p>' + reels[i].join('</p><p>') + '</p></div><div><p>' + reels[i].join('</p><p>') + '</p></div>'
        });

        $msg = $('.msg');

        $('button').click(action);
    }

    function action() {
        if (start !== undefined) return;

        for (var i = 0; i < 3; ++i) {
            speeds[i] = Math.random() + .5;
            r[i] = (Math.random() * 3 | 0) * height / 3;
        }

        $msg.html('Spinning...');
        animate();
    }

    function animate(now) {
        if (!start) start = now;
        var t = now - start || 0;

        for (var i = 0; i < 3; ++i)
            $reels[i].scrollTop = (speeds[i] / tMax / 2 * (tMax - t) * (tMax - t) + r[i]) % height | 0;

        if (t < tMax)
            requestAnimationFrame(animate);
        else {
            start = undefined;
            check();
        }
    }

    function check() {
        multipleCalls++;
        window.localStorage.setItem('spins', JSON.stringify(multipleCalls));
        $msg.html(
            r[0] === 0 && r[1] === 0 && r[2] === 0 && multipleCalls < 4 ?
                'You won! Enjoy your Gift'
                :
                function limit() {
                    if (multipleCalls === 1) {
                        $msg.html('2 spins remaining')
                    }

                    else if (multipleCalls === 2) {
                        $msg.html('1 spin remaining')
                    }

                    else if (multipleCalls === 3) {
                        $msg.html('Sorry! Better Luck Next Time.')
                    }

                    else if (multipleCalls > 3) {
                        $msg.html('Sorry! No more chances.')
                    }
                }
        );
    }

    return { init: init }

})();

$(sm.init);