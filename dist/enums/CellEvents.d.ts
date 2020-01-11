declare enum CellEvents {
    UNCOVERED = "uncovered",
    FLAGGED = "flagged",
    UNFLAGGED = "unflagged",
    MINE_UNCOVERED = "mine_uncovered",
    HIGHLIGHTED = "highlighted",
    UNHIGHLIGHTED = "unhighlighted",
    NEIGHBOR_REVEAL = "neighbor_reveal",
    TRIGGER_CHAIN_REVEAL = "trigger_chain_reveal"
}
export default CellEvents;
