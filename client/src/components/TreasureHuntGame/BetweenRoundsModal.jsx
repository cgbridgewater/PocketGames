
export default function BetweenRoundsModal({ type, currentTreasureValue, onClose }) {

  return (
      <div className="modal_overlay">
          <div className="gold_rush_modal" style={{ borderColor: type === "outOfMoves" ? "" : "rgb(18, 201, 18)" }}>
              <h3 style={{ color: type === "outOfMoves" ? "" : "#D9B14B" }}>
                {
                  type === "outOfMoves"? 
                    "Arrg, no more moves" 
                    : 
                    "Treasure Located" 
                }
              </h3>
              <p>
                {
                  type === "outOfMoves" ?
                    `No coins found. Search for the next treasure`
                    :
                    <><span style={{ color: "#D9B14B", fontWeight: 900 }}>{currentTreasureValue.toLocaleString()}</span> Gold Coins Found</>
                }
              </p>
              <div className="button_box">
                  <button onClick={onClose} autoFocus>Continue</button>
              </div>
          </div>
      </div>
  );
}
