export default abstract class Adjacency {
    public static coordinates(origin: [number, number], dimensions: [number, number]) {
        const adjacentCoordsArray: Array<[number, number]> = [
            // [row, column]
            [ origin[0], origin[1] + 1 ],
            [ origin[0], origin[1] - 1 ],

            [ origin[0] - 1 , origin[1] + 1 ],
            [ origin[0] - 1, origin[1] - 1 ],
            [ origin[0] - 1, origin[1] ],

            [ origin[0] + 1, origin[1] + 1 ],
            [ origin[0] + 1, origin[1] - 1 ],
            [ origin[0] + 1, origin[1] ],
        ];
        // discard any out of bound values ( [0,0] to 'dimensions')
        return adjacentCoordsArray.filter( coordinate => {
            const isLowerBound = coordinate.every( xy => xy >= 0);
            const isUpperBound = (coordinate[0] < dimensions[0] && coordinate[1] < dimensions[1]);
            return isLowerBound && isUpperBound;
        });
    }
}