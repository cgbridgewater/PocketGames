export const Action = {  // strings that match key or button inputs
    RotateRight: "RotateRight",
    RotateLeft: "RotateLeft",
    SlowDrop: "SlowDrop",
    Left: "Left",
    Right: "Right",
    Quit: "Quit",
    Pause: "Pause",
    FastDrop: "FastDrop"
};

export const Key = { // Key codes for actions input
    ArrowUp: Action.FastDrop,
    ArrowDown: Action.SlowDrop,
    ArrowLeft: Action.Left,
    ArrowRight: Action.Right,
    KeyA: Action.RotateLeft,
    KeyB: Action.RotateRight,
    KeyQ: Action.Quit,
    KeyP: Action.Pause
};

export const actionIsDrop = (action) => 
    // function for dropping actions made
    [Action.SlowDrop, Action.FastDrop].includes(action);

export const ActionForKey = (keyCode) => Key[keyCode];