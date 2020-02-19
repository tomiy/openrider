import { ReachableItem } from "./ReachableItem.js";
import { SAVE_CHECKPOINT, DEBUG } from "../../unobfuscated_bhr.js";

export class Checkpoint extends ReachableItem {
    constructor(x, y, parent) {
        super(x, y, parent);
        this.$color = '#00f';
        this.$reachedColor = '#aaf';
        this.$name = 'C';
    }

    onReach(part) {
        part.parnt.doSave |= SAVE_CHECKPOINT;
        DEBUG && console.log('cp', part.parnt.time, JSON.stringify(part.parnt));
    }
}