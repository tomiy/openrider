import { Point } from "../../Point.js";
import { eraserSize } from "../../../bootstrap.js";

export class Line {
    constructor(x1, y1, x2, y2, parent) {
        this.a = x1 instanceof Point ? x1 : new Point(x1, y1);
        this.b = y1 instanceof Point ? y1 : new Point(x2, y2);
        this.vector = this.b.cloneSub(this.a);
        this.len = this.vector.getLength();
        this.doRemove = false;
        this.parnt = parent;
    }

    render(context, offsetLeft, offsetTop) {
        //  Wow, starting a new path and stroking for every line is awful.
        //context.beginPath();
        context.moveTo(this.a.x * this.parnt.zoomFactor - offsetLeft, this.a.y * this.parnt.zoomFactor - offsetTop);
        context.lineTo(this.b.x * this.parnt.zoomFactor - offsetLeft, this.b.y * this.parnt.zoomFactor - offsetTop);
        //context.stroke();
    }

    checkDelete(eraserPoint) {
        let C4 = eraserPoint.cloneSub(this.a);
        let B8 = C4.dot(this.vector.cloneReciprocalScale(this.len));
        let Bi = new Point(0, 0);
        if (B8 <= 0) {
            Bi.copy(this.a);
        } else if (B8 >= this.len) {
            Bi.copy(this.b);
        } else {
            Bi.copy(this.a.cloneAdd(this.vector.cloneReciprocalScale(this.len).cloneScale(B8)));
        }
        let DA = eraserPoint.cloneSub(Bi);
        if (DA.getLength() <= eraserSize) {
            this.remove();
            return this;
        }
        return false;
    }

    remove() {
        this.doRemove = true;
        this.parnt.remove(this.a, this.b);
        return this;
    }

    reAdd() {
        this.parnt.addLineInternal(this);
        return this;
    }

    toString() {
        return this.a + this.getEnd();
    }

    toJSON(cls) {
        return {
            $$: cls,
            a: this.a.toJSON(),
            b: this.b.toJSON()
        };
    }
}