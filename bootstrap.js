import { BIKE_BMX, BIKE_MTB } from "./class/constant/BikeConstants.js";
import { TOOL } from "./class/constant/ToolConstants.js";
import { GHOST_COLORS, MIN_SIZE, TRACK_DEFAULT } from "./class/constant/TrackConstants.js";
import { Game } from "./class/Game.js";
import { CanvasHelper } from "./class/helper/CanvasHelper.js";
import { GhostString } from "./class/helper/GhostString.js";
import { Bomb } from "./class/item/Bomb.js";
import { Boost } from "./class/item/Boost.js";
import { Checkpoint } from "./class/item/Checkpoint.js";
import { Gravity } from "./class/item/Gravity.js";
import { SlowMo } from "./class/item/SlowMo.js";
import { Target } from "./class/item/Target.js";
import { Vector } from "./class/Vector.js";
import { GridBox } from "./class/track/GridBox.js";

const COMPILED = false;
export const DEBUG = !COMPILED;

// Error
if (!document.createElement('canvas').getContext) {
    location.href = 'http://canvasrider.com/error';
}

// Initialize canvas
export var canvas = document.querySelector('[data-play=openrider]');

new CanvasHelper(canvas.getContext('2d'));
let drawer = CanvasHelper.getInstance();

drawer.setProperty('lineCap', 'round');
drawer.setProperty('lineJoin', 'round');
drawer.setProperty('font', '8px eiven');

// Lots of init
export var track, game,
    // Snapping
    snapFromPrevLine = false,
    // Last Clicks
    lastClick = new Vector(40, 50),
    mousePos = new Vector(0, 0),
    // Drawing sizes
    drawingSize = 20,
    eraserSize = 15,
    // ??
    shift = false,
    // Editor Tooling
    backToLastTool = false,
    secretlyErasing = false,
    // Selected Tool label
    label = [],
    // Grid Detail
    gridDetail = 1,
    // Shade Lines
    shadeLines = false,
    // Labels
    hints = [
        ['', 'Restart ( ENTER )', 'Cancel Checkpoint ( BACKSPACE )', '', 'Switch bike ( B - Arrows to control, Z to turn )', '', 'Enable line shading', 'Enable fullscreen ( F )'],
        ['Brush ( A - Hold to snap, hold & scroll to adjust size )', 'Scenery brush ( S - Hold to snap, hold & scroll to adjust size )', 'Lines ( backWheel - Hold to snap )', 'Scenery lines ( W - Hold to snap )', 'Eraser ( E - Hold & scroll to adjust size )', 'Camera ( R - Release or press again to switch back, scroll to zoom )', 'Enable grid snapping ( G )', '', 'Goal', 'Checkpoint', 'Boost', 'Gravity modifier', 'Bomb', 'Slow-Mo', '', 'Shorten last line ( Z )']
    ],
    // Last clicks
    lastForeground = new Vector(40, 50),
    lastScenery = new Vector(-40, 50),
    // DOM
    trackcode = document.getElementById('trackcode'),
    charcount = document.getElementById('charcount'),
    contentElement = document.getElementById('content'),
    newButton = document.getElementById('new'),
    loadButton = document.getElementById('load'),
    saveButton = document.getElementById('save'),
    uploadButton = document.getElementById('upload'),
    toolbar1 = document.getElementById('toolbar1'),
    toolbar2 = document.getElementById('toolbar2');

toolbar1.style.top = canvas.offsetTop + 'px';
toolbar1.style.left = canvas.offsetLeft + 'px';
toolbar1.style.display = 'block';

toolbar2.style.top = canvas.offsetTop + 'px';
toolbar2.style.left = canvas.offsetLeft + canvas.width - 22 + 'px';

function newGame(id, ghosts) {
    game = new Game(id, ghosts);
    track = game.track;
    game.run();
}

export function watchGhost(ID, track) {
    function initGhost(ghostStr, id) {
        let ghostArr = GhostString.parse(ghostStr);
        if (id) {
            track.ghostIDs.push(id);
        }
        track.ghostKeys.push(ghostArr);
        ghostArr.color = GHOST_COLORS[track.ghostInstances.length % GHOST_COLORS.length];
        track.reset();
    }

    if (isNaN(ID)) {
        initGhost(ID);
    } else {
        if (track.ghostIDs !== undefined && !track.ghostIDs.contains(ID)) {
            new Request('ghost/load', {
                method: 'POST',
                data: { id: ID },
                onSuccess: initGhost
            }).send();
        }
    }
}

// TODO: Should be a tool
function switchBikes() {
    track.currentBike = track.currentBike === BIKE_BMX ? BIKE_MTB : BIKE_BMX;
    track.reset();
}

function erase() {
    var deleted = track.checkDelete(mousePos);
    deleted.length && track.pushUndo(function() {
        track.selfAdd(deleted, true);
    }, function() {
        for (var i = 0, l = deleted.length; i < l; i++) {
            deleted[i].remove();
        }
    });
}

function big() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top =
        canvas.style.left = 0;
    canvas.style.border = 'none';
    toolbar2.style.left = canvas.width - (document.documentElement.offsetHeight <= window.innerHeight ? 24 : 39) + 'px';
    label[2] = hints[0][7] = 'Disable fullscreen ( ESC or F )';
    window.scrollTo(0, 0);
    canvas.style.zIndex = 2000;
    toolbar1.style.zIndex = toolbar2.style.zIndex = 2001;
    document.body.style.overflowY = 'hidden';
}

function afterResize() {
    drawer.setProperty('lineCap', 'round');
    drawer.setProperty('lineJoin', 'round');
    drawer.setProperty('font', '8px eiven');
    toolbar1.style.top = toolbar2.style.top = canvas.offsetTop + 'px';
    toolbar1.style.left = canvas.offsetLeft + 'px';
}

window.onresize = function() {
    (canvas.width === 700 ? game.small : big)();
    afterResize();
};

function toggleFullscreen() {
    (canvas.width === 700 ? big : game.small)();
    afterResize();
}

document.onkeydown = function(event) {
    var ctrl = event.ctrlKey;
    switch (event.keyCode) {
        case 8:
            {
                // backspace
                if (canvas.width !== 250) {
                    event.preventDefault();
                }
                track.checkpoints.pop();
                track.restart();
                break;
            }
        case 13:
            {
                // enter
                event.preventDefault();
                track.restart();
                break;
            }
        case 109:
        case 189:
            {
                // minus
                zoom(-1);
                break;
            }
        case 107:
        case 187:
            {
                // plus
                zoom(1);
                break;
            }
        case 32:
            {
                // space
                if (canvas.width !== 250) {
                    event.preventDefault();
                }
                track.paused = !track.paused;
                break;
            }
    }
    if (track.id === undefined) {
        switch (event.keyCode) {
            case 65:
                // A
                if (track.currentTool !== 'brush') {
                    track.currentTool = 'brush';
                    document.body.style.cursor = 'none';
                    shift = true;
                } else if (!snapFromPrevLine) {
                    snapFromPrevLine = true;
                    lastClick.copy(lastForeground);
                    shift = true;
                }
                break;
            case 83:
                // S
                if (track.currentTool !== 'scenery brush') {
                    track.currentTool = 'scenery brush';
                    document.body.style.cursor = 'none';
                    shift = true;
                } else if (!snapFromPrevLine) {
                    snapFromPrevLine = true;
                    lastClick.copy(lastScenery);
                    shift = true;
                }
                break;
            case 81:
                // Q
                if (track.currentTool !== 'line') {
                    track.currentTool = 'line';
                    document.body.style.cursor = 'none';
                } else if (!snapFromPrevLine) {
                    snapFromPrevLine = true;
                    lastClick.copy(lastForeground);
                    shift = true;
                }
                break;
            case 87:
                // W
                if (track.currentTool !== 'scenery line') {
                    track.currentTool = 'scenery line';
                    document.body.style.cursor = 'none';
                } else if (!snapFromPrevLine) {
                    snapFromPrevLine = true;
                    lastClick.copy(lastScenery);
                    shift = true;
                }
                break;
            case 69:
                // E
                track.currentTool = 'eraser';
                document.body.style.cursor = 'none';
                shift = true;
                break;
            case 82:
                // R
                if (track.currentTool !== 'camera') {
                    track.lastTool = track.currentTool;
                    track.currentTool = 'camera';
                    document.body.style.cursor = 'move';
                } else {
                    backToLastTool = true;
                }
                break;
            case 77: // M
                track.undo();
                break;
            case 78: // N
                track.redo();
                break;
            default:
                ;
        }
    }
};
document.onkeyup = function(event) {
    switch (event.keyCode) {
        case 70: // f
        case 27: // esc
            toggleFullscreen();
            break;
        case 66: // B
            switchBikes();
            break;
        case 71: // (G)
            // ghost lock
            if (track.ghostInstances.length) {
                var focalPoint = track.bike.head;
                if (track.focalPoint === track.bike.head) {
                    focalPoint = track.ghostInstances[0].head;
                }
                for (var ghost, i = 0, l = track.ghostInstances.length - 1; i < l; i++) {
                    ghost = track.ghostInstances[i];
                    if (track.focalPoint === ghost.head) {
                        focalPoint = track.ghostInstances[i + 1].head;
                        break;
                    }
                }
                track.focalPoint = focalPoint;
            }
            // grid snapping
            else {
                gridDetail = 11 - gridDetail;
                hints[1][6] = (gridDetail === 1 ? 'En' : 'Dis') + "able grid snapping ( G )";
            }
            break;
        case 82: // R (camera toggle)
            if (backToLastTool) {
                track.currentTool = track.lastTool;
                document.body.style.cursor = 'none';
                backToLastTool = false;
            }
            break;
        case 49: // 1
        case 50: // 2
        case 51: // 3
        case 52: // 4
        case 53: // 5
        case 54: // 6
        case 55: // 7
        case 56: // 8
        case 57: // 9
        case 58: // 0
            if (track.id !== undefined) {
                track.watchGhost(event.keyCode - 48);
            }
            break;
        case 81: // Q
        case 87: // W
        case 69: // E
        case 83: // S
            if (track.ghostInstances.length) {
                // stop focused ghost
                return;
            }
        case 65: // A
            if (shift) {
                shift =
                    snapFromPrevLine = false;
            }
            break;
        default:
            ;
    }
};
toolbar1.onmousemove = function(event) {
    var pos = Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25);
    label = [0, pos, hints[0][pos]];
};
toolbar2.onmousemove = function(event) {
    var pos = Math.floor((event.clientY - toolbar2.offsetTop + window.pageYOffset) / 25);
    label = [1, pos, hints[1][pos]];
    if (pos === 14) {
        if (track.currentTool === TOOL.SLINE || track.currentTool === TOOL.SBRUSH) {
            label[2] = 'Shorten last set of scenery lines ( Z )';
        }
    }
};
toolbar1.onmousedown = function(event) {
    track.focalPoint = false;
    switch (Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25) + 1) {
        case 1:
            track.paused = !track.paused;
            break;
        case 3:
            track.checkpoints.pop();
        case 2:
            track.restart();
            break;
        case 5:
            switchBikes();
            break;
        case 7:
            if (!shadeLines) {
                shadeLines = true;
                label[2] = hints[0][6] = "Disable line shading";
            } else {
                shadeLines = false;
                label[2] = hints[0][6] = "Enable line shading";
            }
            track.cache = [];
            break;
        case 8:
            toggleFullscreen();
            break;
        default:
            ;
    }
};
toolbar2.onmousedown = function(event) {
    if (track.id !== undefined) return false;
    track.focalPoint = false;
    switch (Math.floor((event.clientY - toolbar1.offsetTop + window.pageYOffset) / 25) + 1) {
        case 1:
            track.currentTool = TOOL.BRUSH;
            break;
        case 2:
            track.currentTool = TOOL.SBRUSH;
            break;
        case 3:
            track.currentTool = TOOL.LINE;
            break;
        case 4:
            track.currentTool = TOOL.SLINE;
            break;
        case 5:
            track.currentTool = TOOL.ERASER;
            break;
        case 6:
            track.currentTool = TOOL.CAMERA;
            break;
        case 7:
            if (gridDetail === 1) {
                gridDetail = 10;
                label[2] = hints[1][6] = "Disable grid snapping ( G )";
            } else {
                gridDetail = 1;
                label[2] = hints[1][6] = "Enable grid snapping ( G )";
            }
            break;
        case 9:
            track.currentTool = TOOL.GOAL;
            break;
        case 10:
            track.currentTool = TOOL.CHECKPOINT;
            break;
        case 11:
            track.currentTool = TOOL.BOOST;
            break;
        case 12:
            track.currentTool = TOOL.GRAVITY;
            break;
        case 13:
            track.currentTool = TOOL.BOMB;
            break;
        case 14:
            track.currentTool = TOOL.SLOWMO;
            break;
        case 16:
            track.shortenLastLineSet();
            break;
        default:
            ;
    }
};
canvas.onmouseover = function() {
    label = [];
    document.body.style.cursor = track.currentTool === TOOL.CAMERA ? 'move' : 'none';
};
canvas.onmousedown = function(event) {
    event.preventDefault();
    snapFromPrevLine = true;
    track.focalPoint = false;

    if (event.button === 2 && track.currentTool !== TOOL.CAMERA) {
        erase();
        secretlyErasing = true;
        return;
    }
    var item;
    if (!shift) {
        lastClick.copy(mousePos);
    }
    switch (track.currentTool) {
        case TOOL.BOOST:
        case TOOL.GRAVITY:
            document.body.style.cursor = 'crosshair';
            break;
        case TOOL.ERASER:
            erase();
            break;
        case TOOL.GOAL:
            track.collectables.push(item = new Target(lastClick.x, lastClick.y, track));
            track.numTargets++;
            break;
        case TOOL.CHECKPOINT:
            track.collectables.push(item = new Checkpoint(lastClick.x, lastClick.y, track));
            break;
        case TOOL.BOMB:
            item = new Bomb(lastClick.x, lastClick.y, track);
            break;
        case TOOL.SLOWMO:
            item = new SlowMo(lastClick.x, lastClick.y, track);
        case TOOL.BRUSH:
        case TOOL.SBRUSH:
            if (shift) {
                track.addLine(lastClick, mousePos, track.currentTool !== TOOL.BRUSH);
            }
            shift = false;
            snapFromPrevLine = true;
            break;
        default:
            ;
    }
    if (item !== undefined) {
        var x = Math.floor(item.pos.x / track.gridSize);
        var y = Math.floor(item.pos.y / track.gridSize);
        if (track.grid[x] === undefined) {
            track.grid[x] = [];
        }
        if (track.grid[x][y] === undefined) {
            track.grid[x][y] = new GridBox(x, y);
        }
        track.grid[x][y].powerups.push(item);
        track.pushUndo(function() {
            item.remove();
        }, function() {
            item instanceof Target && ++track.numTargets;
            track.grid[x][y].powerups.push(item);
        });
    }
};
canvas.oncontextmenu = function(event) {
    event.preventDefault();
};
document.onmousemove = function(event) {
    if (track.currentTool !== TOOL.CAMERA) {
        track.focalPoint = false;
    }
    mousePos = new Vector(
        event.clientX - canvas.offsetLeft,
        event.clientY - canvas.offsetTop + window.pageYOffset
    ).normalizeToCanvas(track);
    if (track.currentTool !== TOOL.ERASER && event.button !== 2) {
        mousePos.x = Math.round(mousePos.x / gridDetail) * gridDetail;
        mousePos.y = Math.round(mousePos.y / gridDetail) * gridDetail;
    }
    if (snapFromPrevLine) {
        if (track.currentTool === TOOL.CAMERA) {
            track.camera.selfAdd(lastClick.sub(mousePos));
            mousePos.copy(lastClick);
        } else if (track.currentTool === TOOL.ERASER || event.button === 2) {
            erase();
        } else if (!shift && (track.currentTool === TOOL.BRUSH || track.currentTool === TOOL.SBRUSH) && lastClick.distanceTo(mousePos) >= drawingSize) {
            var line = track.addLine(lastClick, mousePos, track.currentTool !== TOOL.BRUSH);
            track.pushUndo(function() {
                line.remove();
            }, function() {
                line.reAdd();
            });
        }
    }
};
canvas.onmouseup = function() {
    var x, y, item, direction;
    if (secretlyErasing) {
        return secretlyErasing = false;
    }
    if (snapFromPrevLine) {
        if (track.currentTool === TOOL.LINE || track.currentTool === TOOL.SLINE ||
            track.currentTool === TOOL.BRUSH || track.currentTool === TOOL.SBRUSH) {
            var line = track.addLine(lastClick, mousePos, track.currentTool !== TOOL.LINE && track.currentTool !== TOOL.BRUSH);
            track.pushUndo(function() {
                line.remove();
            }, function() {
                line.reAdd();
            });
        } else if (track.currentTool === TOOL.BOOST || track.currentTool === TOOL.GRAVITY) {
            document.body.style.cursor = 'none';
            direction = Math.round(Math.atan2(-(mousePos.x - lastClick.x), mousePos.y - lastClick.y) * 180 / Math.PI);
            item = track.currentTool === TOOL.BOOST ? new Boost(lastClick.x, lastClick.y, direction, track) :
                new Gravity(lastClick.x, lastClick.y, direction, track);
            x = Math.floor(item.pos.x / track.gridSize);
            y = Math.floor(item.pos.y / track.gridSize);
            if (track.grid[x] === undefined) {
                track.grid[x] = [];
            }
            if (track.grid[x][y] === undefined) {
                track.grid[x][y] = new GridBox(x, y);
            }
            track.grid[x][y].powerups.push(item);
            track.pushUndo(function() {
                item.remove();
            }, function() {
                track.grid[x][y].powerups.push(item);
            });
        }
    }
};
document.onmouseup = function() {
    if (!shift) {
        snapFromPrevLine = false;
    }
};
canvas.onmouseout = function() {
    document.body.style.cursor = 'default';
};

// Starting from here stuff can stay in this file

newButton && (newButton.onclick = function() {
    if (confirm('Do you really want to start a new track?')) {
        track = newGame(TRACK_DEFAULT, []);
        charcount.innerHTML = 'Trackcode';
        trackcode.value = null;
        track.reset();
    }
});

loadButton && (loadButton.onclick = function() {
    if (trackcode.value.length > 0) {
        let code = trackcode.value;
        let i = 0;
        let hashes = 0;
        while (i = code.indexOf('#', i) + 1) ++hashes;
        if (code.length < 7 || hashes < 3) {
            return alert('Invalid trackcode!');
        }
        // TODO: parse track code here instead of in Track
        track = newGame(code, []);
        charcount.innerHTML = "Trackcode";
        trackcode.value = null;
        track.reset();
    } else {
        alert("No trackcode to load!");
    }
});

saveButton && (saveButton.onclick = function() {
    if (track.id === undefined) {
        // TODO: generate track code here instead of in Track
        trackcode.value = track.toString();
        trackcode.select();
        let code = trackcode.value;
        let codeDisplay = code >= 1000 ? Math.round(code.length / 1000) + 'k' : code.length;
        charcount.innerHTML = "Trackcode - " + codeDisplay + " - CTRL + C to copy";
    }
});

uploadButton && (uploadButton.onclick = function() {
    var trackcode = track.toString();
    if (trackcode.length > MIN_SIZE) {
        // pause the track and select the camera tool
        track.paused = true;
        track.currentTool = TOOL.CAMERA;
        // start thumb-changing mode and hide superfluous things.
        changeThumb(true);
        toolbar1.style.display = 'none';
        toolbar2.style.display = 'none';
        document.getElementById('track-menu').style.display = 'none';
        drawer.setProperty('lineCap', 'round');
        drawer.setProperty('lineJoin', 'round');

        // TODO: build html elements

        // add events
        inputName.focus();

        submit.addEventListener('click', function() {
            var name, image, desc, trackID, request;

            name = inputName.value;
            if (name.length < 4) { alert('The track name is too short!'); return false; }

            // TODO: Should be its own method, also move it to Track or Game
            var thumb = document.createElement('canvas');
            // get proper upsized thumbnail
            thumb.width = 500;
            thumb.height = 300;
            track.zoomFactor = track.zoomFactor * 2;
            changeThumb(false);
            track.render();
            thumb.getContext('2d').drawImage(
                canvas,
                (canvas.width - 500) / 2, (canvas.height - 300) / 2,
                500, 300,
                0, 0,
                500, 300
            );
            track.zoomFactor = track.zoomFactor / 2;
            image = thumb.toDataURL('image/png');

            desc = inputDesc.value;

            submit.disabled = true;
            request = new XMLHttpRequest();
            request.open('POST', '/tracks/save', false);
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            request.send(
                'n=' + encodeURIComponent(name) +
                '&c=' + encodeURIComponent(trackcode) +
                '&d=' + encodeURIComponent(desc) +
                '&p=' + encodeURIComponent( /*$(optVisibilities).getElement('.active').get('id')*/ 0)
            );
            trackID = JSON.parse(request.responseText);
            if (typeof trackID === 'string') { alert('Your track was refused: ' + trackID); return false; }
            request = new XMLHttpRequest();
            request.open('POST', '/tracks/thumbnail/' + trackID, false);
            request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            request.send(image.replace('data:image/png;base64,', 'i='));
            location.href = '/tracks/' + trackID;
        });
    } else {
        alert('Sorry, but your track must be bigger or more detailed.');
        return false;
    }
});

function zoom(way) {
    if ((way < 0 && track.zoomFactor > 0.2) || (way > 0 && track.zoomFactor < 4)) {
        track.zoomFactor = Math.round(track.zoomFactor * 10 + 2 * way) / 10;
        track.cache = {};
    }
}

function onScroll(e) {
    let zin = e.detail < 0 || e.wheelDelta > 0;
    let zout = e.detail > 0 || e.wheelDelta < 0;
    e.preventDefault();
    if (shift) {
        if (track.currentTool === TOOL.ERASER) {
            if ((zout) && eraserSize > 5) {
                eraserSize -= 5;
            } else if ((zin) && eraserSize < 40) {
                eraserSize += 5;
            }
        } else if (track.currentTool === TOOL.BRUSH || track.currentTool === TOOL.SBRUSH) {
            if ((zout) && drawingSize > 4) {
                drawingSize -= 8;
            } else if ((zin) && drawingSize < 200) {
                drawingSize += 8;
            }
        }
    } else {
        if (zout) { zoom(-1); } else if (zin) { zoom(1); }
    }
    var Cw = new Vector(
        e.clientX - canvas.offsetLeft,
        e.clientY - canvas.offsetTop + window.pageYOffset
    ).normalizeToCanvas(track);
    if (!track.focalPoint) {
        track.camera.selfAdd(mousePos.sub(Cw));
    }
}
canvas.addEventListener('DOMMouseScroll', onScroll, false);
canvas.addEventListener('mousewheel', onScroll, false);

function changeThumb(on) {
    track.changingThumb = on !== false;
}

function getTrack() { return track; }

window.debugMode = DEBUG;

export default {
    game: {
        'ride': newGame,
        'watchGhost': watchGhost,
        'changeThumb': changeThumb
    },
    track: getTrack,
    TRACK_MIN_SIZE: MIN_SIZE
};