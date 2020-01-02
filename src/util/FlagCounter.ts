export default abstract class FlagCounter {

    public static COUNT_UPDATE: string = "flag_count_update";
    public static flagsRemaining: number;

    public static setFlagsRemaining(newValue: number){
        FlagCounter.flagsRemaining = newValue;
        window.dispatchEvent(new CustomEvent<{newValue: number}>(FlagCounter.COUNT_UPDATE, {detail:{newValue: FlagCounter.flagsRemaining}}));
    }

}