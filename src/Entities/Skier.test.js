import { Skier } from "./Skier";

describe('Skier', function () {
    test('starts at position passed during creation', () => {
        const startX = 50;
        const startY = 50;
        const skier = new Skier(startX, startY);

        expect(skier.x).toBe(startX);
        expect(skier.y).toBe(startY);
    });
});