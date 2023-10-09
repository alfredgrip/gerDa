// regex for meeting should catch someting like these
// S01, S02, S1, S2, S100, HTM-1, HTM-2, HTM-Val, VTM-1, VTM-Extra

// regex for clause should catch something that begins with "att" or "Att"

export const meetingRegex = RegExp('^(S|HTM|VTM)-?([0-9]+|(Val|Extra))$');
export const clauseRegex = RegExp('^(att|Att|ATT)');
