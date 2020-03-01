import { Vector } from "../../Vector.js";
import { eraserSize } from "../../../bootstrap.js";

export class Line {
    constructor(x1, y1, x2, y2, parent) {
        this.a = x1 instanceof Vector ? x1 : new Vector(x1, y1);
        this.b = y1 instanceof Vector ? y1 : new Vector(x2, y2);
        this.vector = this.b.cloneSub(this.a);
        this.len = this.vector.getLength();
        this.doRemove = false;
        this.track = parent;
    }

    render(context, offsetLeft, offsetTop) {
        context.moveTo(this.a.x * this.track.zoomFactor - offsetLeft, this.a.y * this.track.zoomFactor - offsetTop);
        context.lineTo(this.b.x * this.track.zoomFactor - offsetLeft, this.b.y * this.track.zoomFactor - offsetTop);
    }

    checkDelete(eraserPoint) {
        let C4 = eraserPoint.cloneSub(this.a);
        let B8 = C4.dot(this.vector.cloneReciprocalScale(this.len));
        let Bi = new Vector(0, 0);
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
        this.track.remove(this.a, this.b);
        return this;
    }

    reAdd() {
        this.track.addLineInternal(this);
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