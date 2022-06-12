import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PaymentSystem } from 'src/app/models/enums/payment-system.enum';

@Component({
    selector: 'app-credit-card',
    templateUrl: './credit-card.component.html',
    styleUrls: ['./credit-card.component.scss']
})
export class CreditCardComponent implements OnInit {
    NAME_MAX_LENGTH = 40;
    CARD_NUMBER_MIN_LENGTH = 15;
    CARD_NUMBER_MAX_LENGTH = 21;
    EXPIRE_DATE_VALID_LENGTH = 5;
    CVV_MIN_LENGTH = 3;
    CVV_MAX_LENGTH = 4;
    notNumbersFormat = RegExp(/\D/gm);
    PaymentSystem = PaymentSystem;

    form: FormGroup;
    cardNumberFirstDigit: number;
    nameFieldErrorMsg: string;
    cardNumberFieldErrorMsg: string;
    dateExpireFieldErrorMsg: string;
    cvvFieldErrorMsg: string;
    showSuccesMsg: boolean = false;

    constructor(
        private formBuilder: FormBuilder,
    ) { }

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.form = this.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(this.NAME_MAX_LENGTH)]],
            cardNumber: ['', [Validators.required, this.getCardNumberMinValidator(this.CARD_NUMBER_MIN_LENGTH), this.getCardNumberChecksumValidator()]],
            dateExpire: ['', [Validators.required, Validators.minLength(this.EXPIRE_DATE_VALID_LENGTH), Validators.maxLength(this.EXPIRE_DATE_VALID_LENGTH),
                this.getDateExpireValidator()]],
            cvv: ['', [Validators.required, Validators.minLength(this.CVV_MIN_LENGTH), Validators.maxLength(this.CVV_MAX_LENGTH)]],
        });

        this.form.valueChanges.subscribe(() => {
            this.showSuccesMsg = false;
        });
    }

    @HostListener('input', ['$event'])
    onInput(e: InputEvent): void {
        const target = e.target as HTMLInputElement;
        const formControlName = target.attributes.getNamedItem('formControlName')?.value as string;

        switch (formControlName) {
            case 'name':
                this.checkNameField(formControlName, target);
                break;
            case 'cardNumber':
                this.checkAndFormatCardNumerField(formControlName, target);
                break;
            case 'dateExpire':
                this.checkAndFormatExpireDateField(formControlName, target);
                break;
            case 'cvv':
                this.checkCvvField(formControlName, target);
                break;
            default:
                return;
        }
    }

    setNameFieldErrorMsg(): void {
        const { errors } = this.form.get('name');

        if (errors != null && errors['required']) {
            this.nameFieldErrorMsg = 'Name is required';
        }
    }

    setCardNumberFieldErrorMsg(): void {
        const { errors } = this.form.get('cardNumber');

        if (errors == null) return;

        if (errors['required']) {
            this.cardNumberFieldErrorMsg = 'Card Number is required';
            return;
        }

        if (errors['cardNumberMin']) {
            this.cardNumberFieldErrorMsg = 'Card Number is too short';
            return;
        }

        if (errors['checksumInvalid']) {
            this.cardNumberFieldErrorMsg = 'Card Number is not existed';
        }
    }

    setDateExpireFieldErrorMsg(): void {
        const { errors } = this.form.get('dateExpire');

        if (errors == null) return;

        if (errors['required']) {
            this.dateExpireFieldErrorMsg = 'Valid Through is required';
            return;
        }

        if (errors['minlength']) {
            this.dateExpireFieldErrorMsg = 'Valid Through is not correct';
            return;
        }

        if (errors['isDateExpire']) {
            this.dateExpireFieldErrorMsg = 'Card is expired';
        }
    }

    setValidateCvvFieldErrorMsg(): void {
        const { errors } = this.form.get('cvv');

        if (errors == null) return;

        if (errors['required']) {
            this.cvvFieldErrorMsg = 'CVV is required';
            return;
        }

        if (errors['minlength']) {
            this.cvvFieldErrorMsg = 'CVV is too short';
        }
    }

    pay(): void {
        this.setNameFieldErrorMsg();
        this.setCardNumberFieldErrorMsg();
        this.setDateExpireFieldErrorMsg();
        this.setValidateCvvFieldErrorMsg();

        this.showSuccesMsg = this.form.valid;
    }

    private checkNameField(controlName: string, target: HTMLInputElement): void {
        if (this.notNumbersFormat.test(target.value) === true) {
            target.value = target.value.replace(this.notNumbersFormat, '');
            this.setFormControlValue(controlName, target.value);
        }

        if (target.value.length > 0) {
            this.nameFieldErrorMsg = '';
        }
    }

    private checkAndFormatCardNumerField(controlName: string, target: HTMLInputElement): void {
        if (this.notNumbersFormat.test(target.value) === true) {
            target.value = target.value.replace(this.notNumbersFormat, '');
            this.setFormControlValue(controlName, target.value);
        }

        if (target.value.length > this.CARD_NUMBER_MAX_LENGTH) {
            target.value = target.value.substring(0, this.CARD_NUMBER_MAX_LENGTH);
            this.setFormControlValue(controlName, target.value);
        }
        
        if (target.value.length > 0) {
            this.cardNumberFieldErrorMsg = '';
        }

        this.cardNumberFirstDigit = parseInt(target.value[0]);
        
        // format card number
        const cardNumberDigits = target.value.split('');
        const quartets = [];
        let fourDigits = '';
        for (let i = 0; i < cardNumberDigits.length; i++) {
            fourDigits += cardNumberDigits[i];
            if ((i + 1) % 4 === 0) {
                quartets.push(fourDigits);
                fourDigits = '';
            }
        }
        quartets.push(fourDigits);

        this.setFormControlValue(controlName, quartets.join(' ').trim());
    }

    private checkAndFormatExpireDateField(controlName: string, target: HTMLInputElement): void {
        target.value = target.value.replace(this.notNumbersFormat, '');

        if (target.value.length > 4) {
            target.value = target.value.substring(0, 4);
            this.setFormControlValue(controlName, target.value);
        }

        if (target.value.length > 0) {
            this.dateExpireFieldErrorMsg = '';
        }

        let month = target.value.substring(0, 2);
        month = parseInt(month) > 12 ? '12' : month;

        const year = target.value.substring(2, 4);

        target.value = target.value.length > 2
            ? `${month}/${year}`
            : month;
        this.setFormControlValue(controlName, target.value);
    }

    private checkCvvField(controlName: string, target: HTMLInputElement): void {
        if (this.notNumbersFormat.test(target.value) === true) {
            target.value = target.value.replace(this.notNumbersFormat, '');
            this.setFormControlValue(controlName, target.value);
        }

        if (target.value.length > 0) {
            this.cvvFieldErrorMsg = '';
        }
    }

    private setFormControlValue(controlName: string, value: string): void {
        this.form.get(controlName)?.setValue(value);
    }

    private getCardNumberMinValidator(minLength: number): ValidatorFn {
        return (c: AbstractControl): ValidationErrors | null => {
            return c.value.replace(this.notNumbersFormat, '').length >= minLength
                ? null
                : { cardNumberMin: {
                    minLength,
                    actual: c.value.length,
                }};
        };
    }

    private getCardNumberChecksumValidator(): ValidatorFn {
        return (c: AbstractControl): ValidationErrors | null => {
            const cardNumber = c.value.replace(this.notNumbersFormat, '');
            const digits = [];

            for (let i = 0; i < cardNumber.length; i++) {
                const currentNumber = parseInt(cardNumber[i]);
                if (i % 2 === 0) {
                    const doubledNumber = currentNumber * 2;
                    if (doubledNumber > 9) {
                        digits.push(doubledNumber - 9);
                    } else {
                        digits.push(doubledNumber);
                    }
                } else {
                    digits.push(currentNumber)
                }
            }

            const summ = digits.reduce((a, b) => a + b, 0);

            return !(summ % 10)
                ? null
                : { 
                    checksumInvalid: true,
                };
        };
    }

    private getDateExpireValidator(): ValidatorFn {
        return (c: AbstractControl): ValidationErrors | null => {       
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear()
                .toString()
                .slice(2);
            const [month, year] = c.value.split('/');

            return parseInt(year) < parseInt(currentYear) || (parseInt(month) < currentMonth && parseInt(year) === parseInt(currentYear))
                ? {
                    isDateExpire: true,
                }
                : null;
        };
    }
}
