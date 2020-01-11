export default abstract class FlagCounter {
    static COUNT_UPDATE: string;
    static flagsRemaining: number;
    static setFlagsRemaining(newValue: number): void;
}
