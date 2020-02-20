import { Point } from "../Point.js";
import { Bike } from "./Bike.js";
import { up, down, left, right, context } from "../../unobfuscated_bhr.js";
import { mtbConstants } from "../constant/TrackConstants.js";
import { PI2, cos, sin } from "../utils/MathUtils.js";
import { beginPath, arc, moveTo, stroke, fill, lineTo } from "../utils/DrawUtils.js";

export class MTB extends Bike {
    constructor(parent, last) {
        super(parent);
        last = last || mtbConstants[0];
        this.$consts = mtbConstants;

        this.restore(last);
        this.head.size = 14;
        this.backWheel.size = 14;
        this.frontWheel.size = 14;
        this.headToBack.lengthTowards = 47;
        this.headToBack.BC = 0.2;
        this.headToBack.BE = 0.3;
        this.frontToBack.lengthTowards = 45;
        this.frontToBack.BC = 0.2;
        this.frontToBack.BE = 0.3;
        this.headToFront.lengthTowards = 45;
        this.headToFront.BC = 0.2;
        this.headToFront.BE = 0.3;
    }

    BS() {
        if (this.doTurn) {
            this.turn();
        }
        this.backWheel.speedValue += (up - this.backWheel.speedValue) / 10;
        if (up) {
            this.distance += this.backWheel.rotationSpeed / 5;
        }
        this.backWheel.downPressed = this.frontWheel.downPressed = down;
        var rotate = left - right;
        this.headToBack.lean(rotate * 5 * this.direction, 5);
        this.headToFront.lean(-rotate * 5 * this.direction, 5);
        this.frontToBack.rotate(rotate / 8);
        if (!rotate && up) {
            this.headToBack.lean(-7, 5);
            this.headToFront.lean(7, 5);
        }
    };

    draw() {
        var track = this.parnt;
        var backWheel = this.backWheel.pos.toPixel(track);
        var pos = this.frontWheel.pos.toPixel(track);
        var head = this.head.pos.toPixel(track);
        var length = pos.cloneSub(backWheel);
        var AC = new Point((pos.y - backWheel.y) * this.direction, (backWheel.x - pos.x) * this.direction);
        var middle = head.cloneSub(backWheel.cloneAdd(length.cloneScale(0.5)));
        // Wheels
        context.strokeStyle = '#000';
        context.lineWidth = 3.5 * track.zoomFactor;
        context[beginPath]()[arc](backWheel.x, backWheel.y, 12.5 * track.zoomFactor, 0, PI2, true)[moveTo](pos.x + 12.5 * track.zoomFactor, pos.y)[arc](pos.x, pos.y, 12.5 * track.zoomFactor, 0, PI2, true)[stroke]()
            // Wheel Axis
            [beginPath]()
            .fillStyle = 'grey';
        context[moveTo](backWheel.x + 5 * track.zoomFactor, backWheel.y)[arc](backWheel.x, backWheel.y, 5 * track.zoomFactor, 0, PI2, true)[moveTo](pos.x + 4 * track.zoomFactor, pos.y)[arc](pos.x, pos.y, 4 * track.zoomFactor, 0, PI2, true)[fill]()
            //
            [beginPath]()
            .lineWidth = 5 * track.zoomFactor;
        context[moveTo](backWheel.x, backWheel.y)[lineTo](backWheel.x + length.x * 0.4 + AC.x * 0.05, backWheel.y + length.y * 0.4 + AC.y * 0.05)[moveTo](backWheel.x + length.x * 0.72 + middle.x * 0.64, backWheel.y + length.y * 0.72 + middle.y * 0.64)[lineTo](backWheel.x + length.x * 0.46 + middle.x * 0.4, backWheel.y + length.y * 0.46 + middle.y * 0.4)[lineTo](backWheel.x + length.x * 0.4 + AC.x * 0.05, backWheel.y + length.y * 0.4 + AC.y * 0.05)[stroke]()
            //
            [beginPath]()
            .lineWidth = 2 * track.zoomFactor;
        var Ap = new Point(6 * cos(this.distance) * track.zoomFactor, 6 * sin(this.distance) * track.zoomFactor);
        context[moveTo](backWheel.x + length.x * 0.72 + middle.x * 0.64, backWheel.y + length.y * 0.72 + middle.y * 0.64)[lineTo](backWheel.x + length.x * 0.43 + AC.x * 0.05, backWheel.y + length.y * 0.43 + AC.y * 0.05)[moveTo](backWheel.x + length.x * 0.45 + middle.x * 0.3, backWheel.y + length.y * 0.45 + middle.y * 0.3)[lineTo](backWheel.x + length.x * 0.3 + middle.x * 0.4, backWheel.y + length.y * 0.3 + middle.y * 0.4)[lineTo](backWheel.x + length.x * 0.25 + middle.x * 0.6, backWheel.y + length.y * 0.25 + middle.y * 0.6)[moveTo](backWheel.x + length.x * 0.17 + middle.x * 0.6, backWheel.y + length.y * 0.17 + middle.y * 0.6)[lineTo](backWheel.x + length.x * 0.3 + middle.x * 0.6, backWheel.y + length.y * 0.3 + middle.y * 0.6)[moveTo](backWheel.x + length.x * 0.43 + AC.x * 0.05 + Ap.x, backWheel.y + length.y * 0.43 + AC.y * 0.05 + Ap.y)[lineTo](backWheel.x + length.x * 0.43 + AC.x * 0.05 - Ap.x, backWheel.y + length.y * 0.43 + AC.y * 0.05 - Ap.y)[stroke]()
            //
            [beginPath]()
            .lineWidth = track.zoomFactor;
        context[moveTo](backWheel.x + length.x * 0.46 + middle.x * 0.4, backWheel.y + length.y * 0.46 + middle.y * 0.4)[lineTo](backWheel.x + length.x * 0.28 + middle.x * 0.5, backWheel.y + length.y * 0.28 + middle.y * 0.5)[stroke]()[beginPath]()
            .lineWidth = 3 * track.zoomFactor;
        context[moveTo](pos.x, pos.y)[lineTo](backWheel.x + length.x * 0.71 + middle.x * 0.73, backWheel.y + length.y * 0.71 + middle.y * 0.73)[lineTo](backWheel.x + length.x * 0.73 + middle.x * 0.77, backWheel.y + length.y * 0.73 + middle.y * 0.77)[lineTo](backWheel.x + length.x * 0.7 + middle.x * 0.8, backWheel.y + length.y * 0.7 + middle.y * 0.8)[stroke]();
        if (this.dead) {
            return;
        }
        context.lineCap = 'round';
        AC = head.cloneSub(backWheel.cloneAdd(length.cloneScale(0.5)));
        var crossFrameSaddle = backWheel.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(0.25));
        var B2 = backWheel.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(0.05));
        var Bp = B2.cloneAdd(Ap);
        var A6 = B2.cloneSub(Ap);
        var A7 = backWheel.cloneAdd(length.cloneScale(0.67)).cloneAdd(AC.cloneScale(0.8));
        var AY = crossFrameSaddle.cloneAdd(length.cloneScale(-0.05)).cloneAdd(AC.cloneScale(0.42));
        var Aa = Bp.cloneSub(AY);
        middle = new Point(Aa.y * this.direction, -Aa.x * this.direction).selfScale(track.zoomFactor * track.zoomFactor);
        var CZ = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(middle.cloneScale(200 / Aa.lengthSquared()));
        Aa = A6.cloneSub(AY);
        middle = new Point(Aa.y * this.direction, -Aa.x * this.direction).selfScale(track.zoomFactor * track.zoomFactor);
        var CX = AY.cloneAdd(Aa.cloneScale(0.5)).cloneAdd(middle.cloneScale(200 / Aa.lengthSquared()));
        context[beginPath]()
            .lineWidth = 6 * track.zoomFactor;
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context[moveTo](A6.x, A6.y)[lineTo](CX.x, CX.y)[lineTo](AY.x, AY.y)[stroke]()[beginPath]()
            .strokeStyle = '#000';
        context[moveTo](Bp.x, Bp.y)[lineTo](CZ.x, CZ.y)[lineTo](AY.x, AY.y)[stroke]()
            .lineWidth = 8 * track.zoomFactor;
        var BX = crossFrameSaddle.cloneAdd(length.cloneScale(0.1)).cloneAdd(AC.cloneScale(0.93));
        var Bl = crossFrameSaddle.cloneAdd(length.cloneScale(0.2)).cloneAdd(AC.cloneScale(1.09));
        var CT = crossFrameSaddle.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(1.15));
        context[beginPath]()[moveTo](AY.x, AY.y)[lineTo](BX.x, BX.y)[stroke]()[beginPath]()
            .lineWidth = 2 * track.zoomFactor;
        context[moveTo](Bl.x + 5 * track.zoomFactor, Bl.y)[arc](Bl.x, Bl.y, 5 * track.zoomFactor, 0, PI2, true)[stroke]()
            // Cap
            [beginPath]();
        switch (this.cap) {
            case 'cap':
                var Ch = crossFrameSaddle.cloneAdd(length.cloneScale(0.4)).cloneAdd(AC.cloneScale(1.15)),
                    Cd = crossFrameSaddle.cloneAdd(length.cloneScale(0.1)).cloneAdd(AC.cloneScale(1.05));
                context[moveTo](Ch.x, Ch.y)[lineTo](Cd.x, Cd.y)[stroke]();
                break;
            case 'hat':
                var hatFrontBottom = crossFrameSaddle.cloneAdd(length.cloneScale(0.37)).cloneAdd(AC.cloneScale(1.19)),
                    hatBackBottom = crossFrameSaddle.cloneSub(length.cloneScale(0.02)).cloneAdd(AC.cloneScale(1.14)),
                    hatFront = crossFrameSaddle.cloneAdd(length.cloneScale(0.28)).cloneAdd(AC.cloneScale(1.17)),
                    hatBack = crossFrameSaddle.cloneAdd(length.cloneScale(0.09)).cloneAdd(AC.cloneScale(1.15)),
                    hatFrontTop = hatFrontBottom.cloneSub(length.cloneScale(0.1)).selfAdd(AC.cloneScale(0.2)),
                    hatBackTop = hatBackBottom.cloneAdd(length.cloneScale(0.02)).selfAdd(AC.cloneScale(0.2));
                context.fillStyle = '#000';
                context[moveTo](hatFrontBottom.x, hatFrontBottom.y)[lineTo](hatFront.x, hatFront.y)[lineTo](hatFrontTop.x, hatFrontTop.y)[lineTo](hatBackTop.x, hatBackTop.y)[lineTo](hatBack.x, hatBack.y)[lineTo](hatBackBottom.x, hatBackBottom.y)[stroke]()[fill]();
        }
        length = BX.cloneSub(A7);
        AC = new Point(length.y * this.direction, -length.x * this.direction);
        AC = AC.cloneScale(track.zoomFactor * track.zoomFactor);
        var CU = A7.cloneAdd(length.cloneScale(0.3)).cloneAdd(AC.cloneScale(80 / length.lengthSquared()));
        context.lineWidth = 5 * track.zoomFactor;
        context[beginPath]()[moveTo](BX.x, BX.y)[lineTo](CU.x, CU.y)[lineTo](A7.x, A7.y)[stroke]();
    };

    getRider() {
        var rider = {},
            M = this.frontWheel.pos.cloneSub(this.backWheel.pos),
            pos = this.head.pos.cloneSub(this.frontWheel.pos.cloneAdd(this.backWheel.pos).cloneScale(0.5)),
            AS = new Point(M.y * this.direction, -M.x * this.direction);
        rider.head = this.backWheel.pos.cloneAdd(M.cloneScale(0.35)).cloneAdd(pos.cloneScale(1.2));
        rider.hand = rider.shadowHand = this.backWheel.pos.cloneAdd(M.cloneScale(0.8)).cloneAdd(AS.cloneScale(0.68));
        var N = rider.head.cloneSub(rider.hand);
        N = new Point(N.y * this.direction, -N.x * this.direction);
        rider.elbow = rider.shadowElbow = rider.head.cloneAdd(rider.hand).cloneScale(0.5).cloneAdd(N.cloneScale(130 / N.lengthSquared()));
        rider.hip = this.backWheel.pos.cloneAdd(M.cloneScale(0.2)).cloneAdd(AS.cloneScale(0.5));
        var R = new Point(6 * cos(this.distance), 6 * sin(this.distance));
        rider.foot = this.backWheel.pos.cloneAdd(M.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneAdd(R);
        N = rider.hip.cloneSub(rider.foot);
        N = new Point(-N.y * this.direction, N.x * this.direction);
        rider.knee = rider.hip.cloneAdd(rider.foot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
        rider.shadowFoot = this.backWheel.pos.cloneAdd(M.cloneScale(0.4)).cloneAdd(AS.cloneScale(0.05)).cloneSub(R);
        N = rider.hip.cloneSub(rider.shadowFoot);
        N = new Point(-N.y * this.direction, N.x * this.direction);
        rider.shadowKnee = rider.hip.cloneAdd(rider.shadowFoot).cloneScale(0.5).cloneAdd(N.cloneScale(160 / N.lengthSquared()));
        return rider;
    };

    toString() {
        return 'MTB';
    };
}