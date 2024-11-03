import { fromEvent, merge, Observable } from "rxjs";
import { map, scan, startWith } from "rxjs/operators";
import { State } from "./types";

const displayElement = document.getElementById("display") as HTMLInputElement;
const keysElement = document.getElementById("keys") as HTMLDivElement;

const initialState: State = {
    display: "",
};

/*******************************************************************/
// Actions 
/*******************************************************************/

type Action = (state: State) => State;

const appendToDisplay = (input: string): Action => (state) => ({
    ...state,
    display: state.display + input,
});

const clearDisplay: Action = (state) => ({
    ...state,
    display: "",
});

const calculate: Action = (state) => {
    try {
        // Dont use eval in production code kids
        return { ...state, display: eval(state.display).toString() };
    } catch {
        return { ...state, display: "Error" };
    }
};

const backSpace: Action = (state) => ({
    ...state,
    display: state.display.slice(0, -1),
});


/*******************************************************************/
// State
/*******************************************************************/

const keyActions$: Observable<Action> = fromEvent(keysElement, "click").pipe(
    map((event) => event.target as HTMLButtonElement),
    map((button) => {
        const value = button.innerText; // or button.dataset.value?
        if (value === "C") return clearDisplay;
        if (value === "=") return calculate;
        if (value === "<") return backSpace;
        return appendToDisplay(value);
    })
);

const state$: Observable<State> = keyActions$.pipe(
    scan((state, action) => action(state), initialState)
);

state$.subscribe((state) => {
    displayElement.value = state.display;
});