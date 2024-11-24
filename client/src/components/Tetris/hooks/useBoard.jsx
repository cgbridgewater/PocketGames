import { useState, useEffect } from "react";
import { buildBoard, nextBoard } from "../utils/Board";

    export const useBoard = ({
        rows,
        columns,
        player,
        resetPlayer,
        addLinesCleared
    }) => {

        // STATE
        const [board, setBoard] = useState(buildBoard({ rows, columns }));

    // CONSTRUCT BOARD
    useEffect(() => {
        setBoard((previousBoard) =>
            nextBoard({
            board: previousBoard,
            player,
            resetPlayer,
            addLinesCleared
            })
        );
    }, [player, resetPlayer, addLinesCleared]);

    return [board];
};