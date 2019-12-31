export default abstract class Random {
    public static int(min: number, max: number): number {
        const _min = Math.ceil(min);
        const _max = Math.floor(max);
        return Math.floor(Math.random() * (_max - _min + 1)) + min;
    }
}