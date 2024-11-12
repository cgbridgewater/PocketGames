
function LightsOutCell({ cellIndex, isOn, toggleLight }){

    function handleToggleLight() {
        toggleLight(cellIndex);
    }

    return (
        <button 
            className={isOn?"lightsout_cell-on":"lightsout_cell-off"} 
            onClick={handleToggleLight}
        />
    );
}

export default LightsOutCell;