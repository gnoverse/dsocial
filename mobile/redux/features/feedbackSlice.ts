import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";

export type Feedback = {
  id: string;
  message: string;
  kind: "error" | "success";
};

interface State {
  /** A queue, so that a second message doesn't replace the first one before it is read. */
  queue: Feedback[];
}

const initialState: State = { queue: [] };

/** What to tell the user about an action's outcome. Mostly fed by the feedbackReporter middleware. */
export const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    reportFeedback: {
      reducer: (state, action: PayloadAction<Feedback>) => {
        if (state.queue.some((item) => item.message === action.payload.message)) return;
        state.queue.push(action.payload);
      },
      prepare: (kind: Feedback["kind"], message: string) => ({ payload: { id: nanoid(), message, kind } }),
    },
    dismissFeedback: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter((item) => item.id !== action.payload);
    },
  },
  selectors: {
    selectCurrentFeedback: (state: State) => state.queue[0] as Feedback | undefined,
  },
});

export const { reportFeedback, dismissFeedback } = feedbackSlice.actions;
export const { selectCurrentFeedback } = feedbackSlice.selectors;
