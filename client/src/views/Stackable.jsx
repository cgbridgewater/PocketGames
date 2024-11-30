import { useGame } from '../components/Stackable/hooks/GameHook';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../components/Stackable/utils/Constants';
import WinningModal from '../components/Modals/WinningModal';
import Header from '../components/GameHeader/GameHeader';

function Stackit() {
    const { canvasRef, score, isWinningModalOpen, restartGame } = useGame();

    return (
        <main>
            {/* Game Header */}
            <Header
                title={"Stack It"}
                onclick={restartGame}
                turn_title={"Level"}
                turns={score}
            />
            {/* Game Canvas */}
            <canvas
                ref={canvasRef}
                id="StackItCanvas"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ border: '1px solid #D9B14B', borderRadius: '12px', marginTop: '-4px' }}
            />
            {/* Winning Pop Up Modal */}
            {isWinningModalOpen && (
                <WinningModal
                message1="You made it to level"
                turns={score}
                message2="!"
                onClose={restartGame}
                />
            )}
            <p id='stack_it_p'>Click Black Area Or Space Bar To Drop A Block</p>
        </main>
    );
}

export default Stackit;