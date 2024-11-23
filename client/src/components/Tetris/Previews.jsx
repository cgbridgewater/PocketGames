import React from "react";

import Preview from "./Preview";

const Previews = ({ tetrominoes }) => {
    // We want everything except the last one
    // const previewTetrominoes = tetrominoes
        tetrominoes    
        .slice(1 - tetrominoes.length)
        .reverse();

    return (
        <>
            {tetrominoes.map((tetromino, index) => (
            // {previewTetrominoes.map((tetromino, index) => (
            <Preview tetromino={tetromino} index={index} key={index} />
            ))}
        </>
    );
};

export default React.memo(Previews);