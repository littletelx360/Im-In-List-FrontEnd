import { FormControl } from '@angular/forms';
import { IForm } from '../models/implements/IForms.interface';

export abstract class Forms implements IForm {
    /**
     * Array of 'FormControl' inputs, that will be evaluated and checked if they are valid or not,
     * also this inputs array is used to display the progress bar valie
     */
    public inputs: Array<FormControl>;

    constructor() { }

    abstract onSubmit(): void;

    /**
     * Summary: getProgressBarValue return a number between 100 and 0 that represents the % of
     * valid inputs, to be used in progress bar visual elements.
     *
     * @return number between 100 and 0, depending of the number of valid inputs found.
     */
    public getProgressBarValue(): number {
        let progress = 100;
        for (const input of this.inputs) {
            if (input.invalid) {
                progress -= 100 / this.inputs.length;
            }
        }
        return progress;
    }

    /**
     * Summary: validateInputs checks if all the inputs are valid, if that is the case it will
     * return true, otherwise false.
     *
     * @return true if all the inputs are true, if any input is not valid it will return false.
     */
    public validateInputs(): boolean {
        let areInputsValid = true;
        for (const input of this.inputs) {
            if (input.invalid) {
                areInputsValid = false;
            }
        }
        return areInputsValid;
    }
}
