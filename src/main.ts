import { fromEvent, merge, Observable } from "rxjs";
import { map, scan, startWith, filter } from "rxjs/operators";
import { State } from "./types";
export { appendToDisplay, clearDisplay, calculate, backSpace };

const displayElement = document.getElementById("display") as HTMLInputElement;
const keysElement = document.getElementById("keys") as HTMLDivElement;
const historyElement = document.getElementById("history") as HTMLDivElement;
const darkModeToggle = document.getElementById("dark-mode-toggle");

const initialState: State = {
    display: "",
    history: [],
};

////////////////////////////////////////////////////////////////////////
// Actions

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
        const result = eval(state.display).toString();
        return { 
            ...state, 
            display: result,
            history: [...state.history, `${state.display} = ${result}`]
        };
    } catch {
        return { ...state, display: "Error" };
    }
};

const backSpace: Action = (state) => ({
    ...state,
    display: state.display.slice(0, -1),
});


////////////////////////////////////////////////////////////////////////
// State and Observables

const keyActions$: Observable<Action> = fromEvent(keysElement, "click").pipe(
    map((event) => event.target as HTMLButtonElement),
    map((button) => {
        const value = button.dataset.value;
        if (value === "C") return clearDisplay;
        if (value === "=") return calculate;
        if (value === "<") return backSpace;
        return value ? appendToDisplay(value) : state => state;
    })
);

const keyPress$: Observable<Action> = fromEvent<KeyboardEvent>(document, "keydown").pipe(
    map((event) => event.key),
    map((key) => {
        if (key === "Enter") return calculate;
        if (key === "Backspace") return backSpace;
        if (key === "Escape") return clearDisplay;
        if ("0123456789+-*/.".includes(key)) return appendToDisplay(key);
        return null;
    }),
    filter((action): action is Action => action !== null)
);

const allActions$: Observable<Action> = merge(keyActions$, keyPress$);

const state$: Observable<State> = allActions$.pipe(
    scan((state, action) => action(state), initialState)
);

state$.subscribe((state) => {
    displayElement.value = state.display;
    historyElement.innerHTML = state.history.join("<br>");
});

if (darkModeToggle) {
    fromEvent(darkModeToggle, "click").subscribe(() => {
        document.body.classList.toggle("dark-mode");
    });
}