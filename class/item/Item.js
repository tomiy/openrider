import { Point } from "../Point.js";
import { context, eraserSize } from "../../unobfuscated_bhr.js";
import { PI2 } from "../utils/MathUtils.js";
import { beginPath, moveTo, arc, fill, stroke } from "../utils/DrawUtils.js";

export class Item {
    static TYPES = {
        f: "Boost",
        g: "Gravity",
        t: "Target",
        c: "Checkpoint",
        e: "Bomb",
        s: "SlowMo"
    };

    static $id = 0;

    constructor(x, y, parent) {
        this.pos = new Point(x, y);
        this.parnt = parent;
        this.$id = Item.$id++;
    }

    draw() {
        var track = this.parnt,
            pos = this.pos.toPixel(track);
        context.fillStyle = this.$color;
        context[beginPath]()[moveTo](pos.x + 7 * track.zoomFactor, pos.y)[arc](pos.x, pos.y, 7 * track.zoomFactor, 0, PI2, true)[fill]()[stroke]();
    }

    touch(part) {
        if (part.pos.distanceToSquared(this.pos) < 500 && !part.parnt.isGhost) {
            this.onTouch(part);
        }
    }

    checkDelete(eraserPoint) {
        if (eraserPoint.distanceTo(this.pos) < eraserSize + 7) {
            this.remove();
            return this;
        }
        return false;
    }

    remove() {
        this.doRemove = true;
        this.parnt.remove(this.pos);
        this.onDelete();
        return this;
    }

    toString() {
        return this.$name + ' ' + this.pos.toString();
    }

    onTouch() {}
    onDelete() {}
}