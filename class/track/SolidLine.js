import { Point } from "../Point.js";
import { Line } from "./Line.js";
import { proto } from "../../unobfuscated_bhr.js";
import { floor } from "../utils/MathUtils.js";

export class SolidLine extends Line {
    constructor(x1, y1, x2, y2, parent) {
        super(x1, y1, x2, y2, parent);
    }

    touch(object) {
        if (this.touched) {
            return this;
        }
        this.touched = true;
        var pos = object.pos,
            AS = object.velocity,
            L = object.size,
            N = new Point(0, 0),
            R = 0,
            Ap = pos.cloneSub(this.a),
            Aw = Ap.dot(this.vector) / this.len / this.len;
        if (Aw >= 0 && Aw <= 1) {
            var B2 = (Ap.x * this.vector.y - Ap.y * this.vector.x) * ((Ap.x - AS.x) * this.vector.y - (Ap.y - AS.y) * this.vector.x) < 0 ? -1 : 1;
            N = Ap.cloneSub(this.vector.cloneScale(Aw));
            R = N.getLength();
            if ((R < L || B2 < 0) && R !== 0) {
                pos.selfAdd(N.cloneScale((L * B2 - R) / R));
                object.drive(new Point(-N.y / R, N.x / R));
                return this;
            }
        }
        if (Aw * this.len < -L || Aw * this.len > this.len + L) {
            return this;
        }
        var Bp = Aw > 0 ? this.b : this.a;
        N = pos.cloneSub(Bp);
        R = N.getLength();
        if (R < L && R !== 0) {
            pos.selfAdd(N.cloneScale((L - R) / R));
            object.drive(new Point(-N.y / R, N.x / R));
            return this;
        }
    }

    getEnd() {
        this.stringGot = true;
        var end = ' ' + this.b.toString(),
            next = this.parnt.grid[floor(this.b.x / this.parnt.gridSize)][floor(this.b.y / this.parnt.gridSize)].search(this.b, 'line');
        if (next !== undefined) {
            end += next.getEnd();
        }
        return end;
    }

    toString() {
        return this.a + this.getEnd();
    }

    toJSON() {
        return Line[proto].toJSON.call(this, 'SolidLine');
    }
}