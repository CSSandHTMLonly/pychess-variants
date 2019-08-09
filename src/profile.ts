import { init } from 'snabbdom';
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import properties from 'snabbdom/modules/props';
import listeners from 'snabbdom/modules/eventlisteners';

const patch = init([klass, attributes, properties, listeners]);

import h from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';

import { Chessground } from 'chessgroundx';

import { renderUsername } from './user';
import { VARIANTS } from './chess';
import { renderTimeago } from './clock';

// TODO: colorize with green/red/nothing if profile user win/lose/other
function result(status, result) {
    var text = '';
    console.log("result()", status, result);
    switch (status) {
    case -2:
    case -1:
        text = 'Playing right now';
        break;
    case 0:
        text = 'Game aborted';
        break;
    case 1:
        text = 'Checkmate';
        break;
    case 2:
        text = 'Resigned';
        break;
    case 3:
        text = 'Stalemate';
        break;
    case 4:
        text = 'Time out';
        break;
    case 5:
        text = 'Draw';
        break;
    case 6:
        text = 'Time out';
        break;
    case 7:
        text = 'Abandoned';
        break
    default:
        text = '*';
        break
    }
    return (status <= 0) ? text : text + ', ' + result;
}


function renderGames(model, games) {
//                h('fn', player["first_name"]),
//                h('ln', player["last_name"]),
//                h('country', player["country"]),
    const header = h('thead', [h('tr', [h('th', model["profileid"]), ])]);
    var rows = games.map((game) => h(
        'tr',
        { on: { click: () => { window.location.assign(model["home"] + '/' + game["_id"]); } },
        }, [
        h('td.board', [
            h('selection.' + VARIANTS[game["v"]].board + '.' + VARIANTS[game["v"]].pieces, [
                h('div.cg-wrap.' + VARIANTS[game["v"]].cg + '.mini', { hook: {
                    insert: (vnode) => {
                        Chessground(vnode.elm as HTMLElement, {
                            coordinates: false,
                            viewOnly: true,
                            fen: game["f"],
                            geometry: VARIANTS[game["v"]].geom
                        });
                    }
                }}),
            ]),
        ]),
        h('td.games-info', [
            h('div.info0', {attrs: {"data-icon": VARIANTS[game["v"]].icon}, class: {"icon": true}}, [
                h('div', [
                    h('div.tc', game["b"] + "+" + game["i"] + " • Casual • " + game["v"]),
                    h('info-date', {attrs: {timestamp: game["d"]}}),
                ]),
            ]),
            h('div', [
                h('player', [
                    h('a.user-link', {attrs: {href: '/@/' + game["us"][0]}}, [
                        h('player-title', " " + game["wt"] + " "),
                        game["us"][0],
                    ]),
                ]),
                h('vs', '-'),
                h('player', [
                    h('a.user-link', {attrs: {href: '/@/' + game["us"][1]}}, [
                        h('player-title', " " + game["bt"] + " "),
                        game["us"][1],
                    ]),
                ]),
            ]),
            h('div.info-result', {
                class: {
                    "win": (game["r"] === '1-0' && game["us"][0] === model["profileid"]) || (game["r"] === '0-1' && game["us"][1] === model["profileid"]),
                    "lose": (game["r"] === '0-1' && game["us"][0] === model["profileid"]) || (game["r"] === '1-0' && game["us"][1] === model["profileid"]),
                }}, result(game["s"], game["r"])
            ),
        ])
        ])
        );
    return [header, h('tbody', rows)];
}

export function profileView(model): VNode[] {
    renderUsername(model["home"], model["username"]);

    var xmlhttp = new XMLHttpRequest();
    var url = model["home"] + "/api/" + model["profileid"] +"/games";

    xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        var myArr = JSON.parse(this.responseText);
        myFunction(myArr);
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();

    function myFunction(arr) {
        const oldVNode = document.getElementById('games');
        console.log(arr);
        if (oldVNode instanceof Element) {
            patch(oldVNode as HTMLElement, h('table#games', renderGames(model, arr)));
        }
        renderTimeago();
    }

    console.log(model);
    return [h('aside.sidebar-first'),
            h('main.main', [h('table#games')]),
            h('aside.sidebar-second'),
        ];
}
